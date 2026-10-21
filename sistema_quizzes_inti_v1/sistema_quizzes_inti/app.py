"""INTI Quizzes: servidor Python sem dependências externas (stdlib + SQLite)."""
from __future__ import annotations
import base64
from collections import Counter
import csv
from datetime import datetime, timezone
import hashlib
import hmac
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import io
import json
import os
from pathlib import Path
import re
import secrets
import sqlite3
import sys
from urllib.parse import parse_qs, urlparse

from engine import evaluate, public_config, validate_quiz, ValidationError
from seed import example_quiz, new_quiz

ROOT = Path(__file__).resolve().parent
UPLOAD_DIR = Path(os.getenv('QUIZ_UPLOAD_DIR', str(ROOT / 'uploads')))
DB_PATH = Path(os.getenv('QUIZ_DB_PATH', str(ROOT / 'quizzes.sqlite3')))
PASSWORD = os.getenv('QUIZ_ADMIN_PASSWORD', '')
SECRET = os.getenv('QUIZ_SESSION_SECRET', PASSWORD + '::inti::local')
HOST = os.getenv('QUIZ_HOST', '127.0.0.1')
PORT = int(os.getenv('QUIZ_PORT', '8000'))
KNOWN_EVENTS = {'quiz_viewed','quiz_started','question_viewed','question_answered','quiz_completed',
    'result_reveal_clicked','result_viewed','result_video_started','result_video_completed',
    'microcommitment_answered','capacity_selected','desire_expansion_answered','invite_viewed',
    'offer_video_started','offer_video_completed','form_started','lead_submitted','checkout_started','access_clicked'}


def utcnow():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')


def db():
    c = sqlite3.connect(DB_PATH, timeout=30)
    c.row_factory = sqlite3.Row
    c.execute('PRAGMA foreign_keys=ON')
    c.execute('PRAGMA journal_mode=WAL')
    return c


def initialize():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with db() as c:
        c.executescript('''
          CREATE TABLE IF NOT EXISTS quizzes (
           id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, published_slug TEXT, status TEXT NOT NULL,
           draft_json TEXT NOT NULL, published_json TEXT, version INTEGER NOT NULL DEFAULT 0,
           created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS slug_aliases (
           alias TEXT PRIMARY KEY, quiz_id TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS quiz_versions (
           quiz_id TEXT NOT NULL, version INTEGER NOT NULL, content_json TEXT NOT NULL, published_at TEXT NOT NULL,
           PRIMARY KEY(quiz_id, version));
          CREATE TABLE IF NOT EXISTS sessions (
           id TEXT PRIMARY KEY, quiz_id TEXT NOT NULL, version INTEGER NOT NULL, snapshot_json TEXT NOT NULL,
           origin_json TEXT, started_at TEXT NOT NULL, completed_at TEXT, result_json TEXT,
           capacity_id TEXT, microcommitment TEXT, desire_answer TEXT, lead_name TEXT,
           lead_email TEXT, lead_whatsapp TEXT, consent_at TEXT, consent_version TEXT, marketing_optin INTEGER);
          CREATE TABLE IF NOT EXISTS answers (
           session_id TEXT NOT NULL, question_id TEXT NOT NULL, option_id TEXT NOT NULL,
           answered_at TEXT NOT NULL, PRIMARY KEY(session_id,question_id));
          CREATE TABLE IF NOT EXISTS events (
           id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL,
           quiz_id TEXT NOT NULL, name TEXT NOT NULL, screen_id TEXT, metadata_json TEXT,
           created_at TEXT NOT NULL);
          CREATE INDEX IF NOT EXISTS events_quiz_idx ON events(quiz_id,name);
          CREATE INDEX IF NOT EXISTS sessions_quiz_idx ON sessions(quiz_id);
        ''')
        # Migração para instalações anteriores.
        columns={r[1] for r in c.execute('PRAGMA table_info(quizzes)').fetchall()}
        if 'published_slug' not in columns: c.execute('ALTER TABLE quizzes ADD COLUMN published_slug TEXT')
        if not c.execute('SELECT 1 FROM quizzes LIMIT 1').fetchone():
            example = example_quiz()
            c.execute('INSERT INTO quizzes (id,slug,status,draft_json,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?)',
                (secrets.token_hex(10), example['slug'], 'rascunho', json.dumps(example,ensure_ascii=False), 0, utcnow(), utcnow()))


def dump(data):
    return json.dumps(data, ensure_ascii=False, separators=(',', ':'))


def record(c, sid, quiz_id, event, screen='', meta=None):
    if event not in KNOWN_EVENTS:
        raise ValidationError('Evento desconhecido.')
    c.execute('INSERT INTO events(session_id,quiz_id,name,screen_id,metadata_json,created_at) VALUES (?,?,?,?,?,?)',
        (sid, quiz_id, event, str(screen)[:100], dump(meta or {})[:4000], utcnow()))


def get_quiz(c, ident):
    return c.execute('SELECT * FROM quizzes WHERE id=? OR slug=?', (ident,ident)).fetchone()


def get_session(c, sid, quiz_id=None):
    row = c.execute('SELECT * FROM sessions WHERE id=?',(sid,)).fetchone()
    if not row or (quiz_id and row['quiz_id'] != quiz_id):
        raise ValidationError('Sessão não encontrada.')
    return row


def load_draft(row):
    return json.loads(row['draft_json'])


def auth_token():
    ts = str(int(datetime.now(timezone.utc).timestamp()))
    sig = hmac.new(SECRET.encode(), f'admin:{ts}'.encode(), hashlib.sha256).hexdigest()
    return f'{ts}.{sig}'


def auth_ok(headers):
    cookie = SimpleCookie()
    try:
        cookie.load(headers.get('Cookie',''))
        raw = cookie.get('inti_admin')
        if raw is None:
            return False
        ts, sig = raw.value.split('.',1)
        age = datetime.now(timezone.utc).timestamp() - int(ts)
        if not (0 <= age < 43200):
            return False
        expected = hmac.new(SECRET.encode(), f'admin:{ts}'.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, sig)
    except (ValueError, TypeError):
        return False


class Handler(BaseHTTPRequestHandler):
    server_version = 'INTIQuizzes/1.0'

    def log_message(self, fmt, *args):
        print(f'[{utcnow()}] {self.address_string()} {fmt % args}')

    def json_response(self, data, status=200, headers=None):
        body = dump(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length',str(len(body)))
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','same-origin')
        for k,v in (headers or {}).items(): self.send_header(k,v)
        self.end_headers(); self.wfile.write(body)

    def fail(self, message, status=400):
        self.json_response({'error':str(message)}, status)

    def data(self):
        length = int(self.headers.get('Content-Length','0'))
        if length <= 0 or length > 8_000_000:
            raise ValidationError('Requisição vazia ou muito grande.')
        try:
            return json.loads(self.rfile.read(length))
        except (ValueError,UnicodeError):
            raise ValidationError('JSON inválido.')

    def check_origin(self):
        origin = self.headers.get('Origin')
        if origin and urlparse(origin).netloc != self.headers.get('Host'):
            raise PermissionError('Origem não permitida.')

    def secure_cookie(self, val):
        secure = '; Secure' if self.headers.get('X-Forwarded-Proto') == 'https' else ''
        return f'inti_admin={val}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200{secure}'

    def static_file(self, path):
        paths = {'/':'admin.html','/admin':'admin.html','/static/admin.html':'admin.html',
                 '/static/quiz.html':'quiz.html','/static/admin.js':'admin.js',
                 '/static/quiz.js':'quiz.js','/static/style.css':'style.css',
                 '/favicon.svg':'favicon.svg'}
        if path.startswith('/quiz/'):
            name='quiz.html'
        else:
            name=paths.get(path)
        if path.startswith('/uploads/'):
            filename=path[len('/uploads/'):]
            if not re.fullmatch(r'[a-f0-9]{32}\.(?:png|jpg|webp)',filename):
                return self.fail('Arquivo indisponível.',404)
            file=UPLOAD_DIR/filename
            if not file.exists():return self.fail('Arquivo indisponível.',404)
            payload=file.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', {'.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'}[file.suffix])
            self.send_header('Content-Length',str(len(payload)))
            self.send_header('X-Content-Type-Options','nosniff')
            self.send_header('Cache-Control','public, max-age=604800')
            self.end_headers();return self.wfile.write(payload)
        if not name:
            return self.fail('Página não encontrada.', 404)
        file = ROOT/'static'/name
        types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
               '.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'}
        payload=file.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type',types[file.suffix]); self.send_header('Content-Length',str(len(payload)))
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','strict-origin-when-cross-origin')
        self.send_header('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; media-src 'self' https:; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'")
        self.end_headers(); self.wfile.write(payload)

    def do_GET(self):
        try:
            u = urlparse(self.path); path = u.path
            if path == '/api/auth/me':
                return self.json_response({'authenticated':auth_ok(self.headers)})
            if path.startswith('/api/admin/'):
                if not auth_ok(self.headers): return self.fail('Faça login.',401)
                return self.get_admin(path,parse_qs(u.query))
            if path.startswith('/api/public/'):
                return self.get_public(path,parse_qs(u.query))
            return self.static_file(path)
        except ValidationError as e: self.fail(e)
        except Exception as e:
            print('GET ERROR:',repr(e)); self.fail('Erro interno do servidor.',500)

    def do_POST(self):
        try:
            self.check_origin()
            path=urlparse(self.path).path
            data=self.data()
            if not isinstance(data,dict):return self.fail('Envie um objeto JSON.')
            if path == '/api/auth/login':
                if not isinstance(data,dict) or not hmac.compare_digest(str(data.get('password','')),PASSWORD):
                    return self.fail('Senha incorreta.',401)
                return self.json_response({'ok':True},headers={'Set-Cookie':self.secure_cookie(auth_token())})
            if path == '/api/auth/logout':
                return self.json_response({'ok':True},headers={'Set-Cookie':'inti_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'})
            if path.startswith('/api/admin/'):
                if not auth_ok(self.headers): return self.fail('Faça login.',401)
                if path=='/api/admin/upload': return self.upload_media(data)
                return self.post_admin(path,data)
            if path.startswith('/api/public/'):
                return self.post_public(path,data)
            return self.fail('Rota não encontrada.',404)
        except PermissionError as e: self.fail(e,403)
        except ValidationError as e: self.fail(e)
        except (sqlite3.IntegrityError) as e: self.fail('Este slug já existe ou os dados conflitam.')
        except Exception as e:
            print('POST ERROR:',repr(e)); self.fail('Erro interno do servidor.',500)

    def upload_media(self,data):
        """Recebe PNG/JPEG/WebP; impede SVG e conteúdo ativo."""
        raw=data.get('base64','')
        if not isinstance(raw,str) or len(raw)>7_000_000:
            return self.fail('Envie uma imagem de até 4 MB.')
        try:
            encoded=raw.split(',',1)[-1]
            payload=base64.b64decode(encoded, validate=True)
        except (ValueError,TypeError):return self.fail('Imagem inválida.')
        if not payload or len(payload)>4_000_000:return self.fail('Imagem vazia ou maior que 4 MB.')
        if payload.startswith(b'\x89PNG\r\n\x1a\n'):ext='png'
        elif payload[:3]==b'\xff\xd8\xff':ext='jpg'
        elif payload[:4]==b'RIFF' and payload[8:12]==b'WEBP':ext='webp'
        else:return self.fail('Formato de imagem não permitido. Envie PNG, JPG ou WebP.')
        name=secrets.token_hex(16)+'.'+ext
        (UPLOAD_DIR/name).write_bytes(payload)
        return self.json_response({'url':'/uploads/'+name})

    def get_admin(self,path,params):
        with db() as c:
            if path == '/api/admin/quizzes':
                rows=c.execute('''SELECT q.*, (SELECT COUNT(*) FROM events e WHERE e.quiz_id=q.id AND e.name='quiz_started') started,
                  (SELECT COUNT(*) FROM sessions s WHERE s.quiz_id=q.id AND s.completed_at IS NOT NULL) completed,
                  (SELECT COUNT(*) FROM sessions s WHERE s.quiz_id=q.id AND s.lead_email IS NOT NULL) leads
                  FROM quizzes q ORDER BY q.updated_at DESC''').fetchall()
                return self.json_response([{'id':r['id'],'slug':r['slug'],'status':r['status'],'version':r['version'],
                    'title':load_draft(r).get('title'),'name':load_draft(r).get('internal_name'),
                    'created_at':r['created_at'],'updated_at':r['updated_at'],'started':r['started'],'completed':r['completed'],'leads':r['leads']} for r in rows])
            m=re.fullmatch(r'/api/admin/quizzes/([a-z0-9-]+)',path)
            if m:
                row=get_quiz(c,m.group(1))
                if not row:return self.fail('Quiz não encontrado.',404)
                return self.json_response({'id':row['id'],'status':row['status'],'version':row['version'],
                   'draft':load_draft(row),'published':bool(row['published_json'])})
            m=re.fullmatch(r'/api/admin/metrics/([a-z0-9-]+)',path)
            if m:
                row=get_quiz(c,m.group(1))
                if not row:return self.fail('Quiz não encontrado.',404)
                ss=c.execute('SELECT result_json,capacity_id,lead_email,origin_json,completed_at FROM sessions WHERE quiz_id=?',(row['id'],)).fetchall()
                counts={name:n for name,n in c.execute('SELECT name, COUNT(*) n FROM events WHERE quiz_id=? GROUP BY name',(row['id'],)).fetchall()}
                results=Counter(); caps=Counter(); campaigns=Counter()
                for s in ss:
                    if s['result_json']:
                        results[json.loads(s['result_json'])['winner_id']]+=1
                    if s['capacity_id']:caps[s['capacity_id']]+=1
                    if s['origin_json']:
                        origin=json.loads(s['origin_json'])
                        campaigns[origin.get('utm_source','direto') or 'direto']+=1
                return self.json_response({'sessions':len(ss),'starts':counts.get('quiz_started',0),'completed':sum(bool(s['completed_at']) for s in ss),
                   'leads':sum(bool(s['lead_email']) for s in ss), 'events':counts,
                   'profiles':results,'capacities':caps,'sources':campaigns})
            m=re.fullmatch(r'/api/admin/export/([a-z0-9-]+)',path)
            if m:
                row=get_quiz(c,m.group(1))
                if not row:return self.fail('Quiz não encontrado.',404)
                records=c.execute('SELECT * FROM sessions WHERE quiz_id=? ORDER BY started_at DESC',(row['id'],)).fetchall()
                output=io.StringIO(); w=csv.writer(output)
                w.writerow(['sessao','inicio','conclusao','resultado','segundo','capacidade','origem_utm','nome','email','whatsapp','aceite_em','marketing'])
                for s in records:
                    res=json.loads(s['result_json']) if s['result_json'] else {}
                    w.writerow([s['id'],s['started_at'],s['completed_at'],res.get('winner_id'),res.get('second_id'),s['capacity_id'],s['origin_json'],s['lead_name'],s['lead_email'],s['lead_whatsapp'],s['consent_at'],s['marketing_optin']])
                body=output.getvalue().encode('utf-8-sig'); self.send_response(200)
                self.send_header('Content-Type','text/csv; charset=utf-8'); self.send_header('Content-Disposition','attachment; filename="leads-quizzes.csv"');self.send_header('Content-Length',str(len(body)))
                self.end_headers();return self.wfile.write(body)
        return self.fail('Rota não encontrada.',404)

    def post_admin(self,path,data):
        with db() as c:
            if path == '/api/admin/quizzes':
                obj=data.get('quiz') if isinstance(data,dict) else None
                if obj is None:
                    obj=new_quiz()
                errors=validate_quiz(obj)
                if errors:return self.fail('; '.join(errors))
                ident=secrets.token_hex(10)
                c.execute('INSERT INTO quizzes(id,slug,status,draft_json,created_at,updated_at) VALUES (?,?,?,?,?,?)',
                          (ident,obj['slug'],'rascunho',dump(obj),utcnow(),utcnow()))
                c.commit();return self.json_response({'id':ident},201)
            m=re.fullmatch(r'/api/admin/quizzes/([a-z0-9-]+)/(save|publish|duplicate|pause|archive|simulate|delete-data)',path)
            if not m:return self.fail('Rota não encontrada.',404)
            ident,action=m.groups();row=get_quiz(c,ident)
            if not row:return self.fail('Quiz não encontrado.',404)
            obj=load_draft(row)
            if action=='save':
                candidate=data.get('quiz')
                errors=validate_quiz(candidate)
                if errors:c.commit();return self.json_response({'errors':errors},400)
                candidate['weights_reviewed']=bool(candidate.get('weights_reviewed'))
                # Editing live content must never edit published snapshot.
                c.execute('UPDATE quizzes SET slug=?,draft_json=?,updated_at=? WHERE id=?',
                          (candidate['slug'],dump(candidate),utcnow(),row['id']))
                c.commit();return self.json_response({'ok':True})
            if action=='publish':
                errors=validate_quiz(obj,publishing=True)
                if errors:c.commit();return self.json_response({'errors':errors},400)
                version=row['version']+1
                content=dump(obj)
                if row['published_slug'] and row['published_slug'] != obj['slug']:
                    c.execute('INSERT OR REPLACE INTO slug_aliases(alias,quiz_id) VALUES (?,?)', (row['published_slug'],row['id']))
                c.execute('UPDATE quizzes SET published_json=?,published_slug=?,version=?,status=?,updated_at=? WHERE id=?',
                    (content,obj['slug'],version,'publicado',utcnow(),row['id']))
                c.execute('INSERT INTO quiz_versions VALUES (?,?,?,?)',(row['id'],version,content,utcnow()))
                c.commit();return self.json_response({'ok':True,'version':version})
            if action in ('pause','archive'):
                c.execute('UPDATE quizzes SET status=?,updated_at=? WHERE id=?',
                          ('pausado' if action=='pause' else 'arquivado',utcnow(),row['id']))
                c.commit();return self.json_response({'ok':True})
            if action=='duplicate':
                obj['slug']=obj['slug']+'-copia-'+secrets.token_hex(2)
                obj['internal_name']=obj.get('internal_name','Quiz')+' (cópia)'
                obj['weights_reviewed']=False
                newid=secrets.token_hex(10)
                c.execute('INSERT INTO quizzes(id,slug,status,draft_json,created_at,updated_at) VALUES (?,?,?,?,?,?)',
                         (newid,obj['slug'],'rascunho',dump(obj),utcnow(),utcnow()))
                c.commit();return self.json_response({'id':newid},201)
            if action=='simulate':
                try:
                    c.commit();return self.json_response(evaluate(obj,data.get('answers')))
                except (ValidationError,TypeError,KeyError) as e:
                    return self.fail(e)
            if action=='delete-data':
                if data.get('confirm') != 'EXCLUIR':return self.fail('Confirme escrevendo EXCLUIR.')
                # Delete all participant data for this quiz, only for explicit admin request.
                ids=[r['id'] for r in c.execute('SELECT id FROM sessions WHERE quiz_id=?',(row['id'],)).fetchall()]
                c.execute('DELETE FROM events WHERE quiz_id=?',(row['id'],))
                for sid in ids:c.execute('DELETE FROM answers WHERE session_id=?',(sid,))
                c.execute('DELETE FROM sessions WHERE quiz_id=?',(row['id'],))
                c.commit();return self.json_response({'deleted_sessions':len(ids)})

    def find_published(self,c,slug):
        row=c.execute('SELECT * FROM quizzes WHERE published_slug=?',(slug,)).fetchone()
        if not row:
            alias=c.execute('SELECT quiz_id FROM slug_aliases WHERE alias=?',(slug,)).fetchone()
            if alias: row=c.execute('SELECT * FROM quizzes WHERE id=?',(alias['quiz_id'],)).fetchone()
        return row

    def get_public(self,path,params):
        m=re.fullmatch(r'/api/public/([a-z0-9-]+)',path)
        if not m:return self.fail('Rota não encontrada.',404)
        slug=m.group(1)
        preview=params.get('preview',['0'])[0]=='1' and auth_ok(self.headers)
        with db() as c:
            row=get_quiz(c,slug) if preview else self.find_published(c,slug)
            if not row or (not preview and (row['status']!='publicado' or not row['published_json'])):
                return self.fail('Quiz indisponível. Verifique a publicação.',404)
            config=load_draft(row) if preview else json.loads(row['published_json'])
            public=public_config(config)
            if not preview:public['profiles']=[]
            return self.json_response({'quiz':public,'preview':preview,'quiz_id':row['id'] if preview else None,'version':row['version']})

    def post_public(self,path,data):
        m=re.fullmatch(r'/api/public/([a-z0-9-]+)/(view|start|answer|finish|event|micro|capacity|desire|lead)',path)
        if not m:return self.fail('Rota não encontrada.',404)
        slug,action=m.groups()
        with db() as c:
            row=self.find_published(c,slug)
            if not row or row['status']!='publicado' or not row['published_json']:
                return self.fail('Quiz indisponível.',404)
            quiz_id=row['id']; config=json.loads(row['published_json'])
            if action in ('view','start') and not data.get('session_id'):
                origin={k:str((data.get('origin') or {}).get(k,''))[:250] for k in ('utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer')}
                sid=secrets.token_urlsafe(27)
                c.execute('INSERT INTO sessions(id,quiz_id,version,snapshot_json,origin_json,started_at) VALUES (?,?,?,?,?,?)',
                          (sid,quiz_id,row['version'],row['published_json'],dump(origin),utcnow()))
                record(c,sid,quiz_id,'quiz_viewed','capa')
                if action=='start':record(c,sid,quiz_id,'quiz_started','capa')
                c.commit();return self.json_response({'session_id':sid})
            sid=data.get('session_id');session=get_session(c,sid,quiz_id)
            if action=='start':
                if not c.execute('SELECT 1 FROM events WHERE session_id=? AND name=? LIMIT 1',(sid,'quiz_started')).fetchone():
                    record(c,sid,quiz_id,'quiz_started','capa')
                c.commit();return self.json_response({'session_id':sid})
            snap=json.loads(session['snapshot_json'])
            if action in ('answer','finish') and not c.execute('SELECT 1 FROM events WHERE session_id=? AND name=? LIMIT 1',(sid,'quiz_started')).fetchone():
                return self.fail('Inicie o teste antes de responder.')
            if action=='answer':
                if session['completed_at']:return self.fail('Quiz já concluído.')
                q=next((q for q in snap['questions'] if q['id']==data.get('question_id')),None)
                if not q or not any(o['id']==data.get('option_id') for o in q['options']):
                    return self.fail('Pergunta ou opção inválida.')
                c.execute('INSERT INTO answers(session_id,question_id,option_id,answered_at) VALUES (?,?,?,?) ON CONFLICT(session_id,question_id) DO UPDATE SET option_id=excluded.option_id,answered_at=excluded.answered_at',
                    (sid,q['id'],data['option_id'],utcnow()))
                record(c,sid,quiz_id,'question_answered',q['id'],{'option_id':data['option_id']})
                c.commit();return self.json_response({'ok':True})
            if action=='finish':
                if session['result_json']:
                    result=json.loads(session['result_json'])
                else:
                    answers={r['question_id']:r['option_id'] for r in c.execute('SELECT question_id,option_id FROM answers WHERE session_id=?',(sid,)).fetchall()}
                    result=evaluate(snap,answers)
                    c.execute('UPDATE sessions SET completed_at=?,result_json=? WHERE id=?',(utcnow(),dump(result),sid))
                    record(c,sid,quiz_id,'quiz_completed','processamento')
                profile=(snap.get('neutral_result') or {'title':'Sem padrão dominante claro','summary':'Suas respostas não indicaram um padrão predominante.','video_intro':'Este resultado não define sua identidade.','video_url':''}) if result['winner_id']=='NEUTRAL' else next(p for p in snap['profiles'] if p['id']==result['winner_id'])
                c.commit();return self.json_response({'result':result,'profile':public_config({'profiles':[profile]})['profiles'][0]})
            if action=='event':
                event=data.get('name')
                if event not in KNOWN_EVENTS or event in ('purchase_completed','lead_submitted','quiz_completed','quiz_started','question_answered'):
                    return self.fail('Evento não permitido.')
                record(c,sid,quiz_id,event,data.get('screen_id',''),data.get('metadata',{}))
                c.commit();return self.json_response({'ok':True})
            if action=='micro':
                if not session['completed_at']:return self.fail('Conclua o quiz primeiro.')
                value=str(data.get('value',''))[:80]
                if value not in ('mudar','entender'):return self.fail('Resposta inválida.')
                c.execute('UPDATE sessions SET microcommitment=? WHERE id=?',(value,sid))
                record(c,sid,quiz_id,'microcommitment_answered','microcompromisso',{'value':value})
                c.commit();return self.json_response({'ok':True})
            if action=='capacity':
                if not session['completed_at']:return self.fail('Conclua o quiz primeiro.')
                cid=data.get('capacity_id')
                if not any(cap['id']==cid for cap in snap['capacities']):return self.fail('Capacidade inválida.')
                c.execute('UPDATE sessions SET capacity_id=? WHERE id=?',(cid,sid))
                record(c,sid,quiz_id,'capacity_selected','capacidade',{'capacity_id':cid})
                c.commit();return self.json_response({'ok':True})
            if action=='desire':
                value=str(data.get('value',''))[:90]
                if value not in ('muita_diferenca','exatamente'):return self.fail('Resposta inválida.')
                c.execute('UPDATE sessions SET desire_answer=? WHERE id=?',(value,sid))
                record(c,sid,quiz_id,'desire_expansion_answered','expansao',{'value':value})
                c.commit();return self.json_response({'ok':True})
            if action=='lead':
                if not session['completed_at']:return self.fail('Conclua o quiz primeiro.')
                name=str(data.get('name','')).strip()[:120];email=str(data.get('email','')).strip()[:200]
                whatsapp=re.sub(r'[^0-9+]','',str(data.get('whatsapp','')))[:25]
                if not (2<=len(name)<=120) or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',email) or not (8<=len(re.sub('[^0-9]','',whatsapp))<=15):
                    return self.fail('Confira nome, e-mail e WhatsApp.')
                if data.get('acknowledged_privacy') is not True:
                    return self.fail('Confirme que leu a política de privacidade.')
                c.execute('UPDATE sessions SET lead_name=?,lead_email=?,lead_whatsapp=?,consent_at=?,consent_version=?,marketing_optin=? WHERE id=?',
                    (name,email,whatsapp,utcnow(),str(snap.get('consent_version','v1')),int(bool(data.get('marketing_optin'))),sid))
                record(c,sid,quiz_id,'lead_submitted','cadastro')
                c.commit();return self.json_response({'ok':True,'name':name,'access_url':snap.get('offer',{}).get('access_url','')})
        return self.fail('Rota não encontrada.',404)


def main():
    if not PASSWORD or len(PASSWORD)<8:
        sys.exit('Defina QUIZ_ADMIN_PASSWORD com ao menos 8 caracteres antes de iniciar. Consulte README.md.')
    if HOST not in ('127.0.0.1','localhost','::1') and not os.getenv('QUIZ_SESSION_SECRET'):
        sys.exit('Para acesso em rede defina QUIZ_SESSION_SECRET com valor aleatório e use HTTPS. Consulte README.')
    initialize()
    server=ThreadingHTTPServer((HOST,PORT),Handler)
    print(f'INTI Quizzes: http://{HOST}:{PORT}/admin (painel) | http://{HOST}:{PORT}/quiz/padroes-relacionamentos (quiz após publicar)')
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()

if __name__=='__main__': main()
