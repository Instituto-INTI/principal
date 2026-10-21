"""Testes automáticos do motor e das APIs, sem bibliotecas externas."""
import base64
from http.cookiejar import CookieJar
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.error
import urllib.request

from engine import evaluate, validate_quiz, ValidationError, public_config
from seed import example_quiz


class EngineTests(unittest.TestCase):
    def setUp(self):self.quiz=example_quiz()
    def test_seed_source_has_10_questions_4_patterns_7_capacities(self):
        self.assertEqual((len(self.quiz['questions']),len(self.quiz['profiles']),len(self.quiz['capacities'])),(10,4,7))
    def test_seed_unapproved_and_missing_videos_block_publication(self):
        errors=validate_quiz(self.quiz,True)
        self.assertTrue(any('matriz' in x.lower() for x in errors))
        self.assertTrue(any('vídeo' in x.lower() for x in errors))
    def test_normalized_scores_and_pattern_three(self):
        choices=['q01_4','q02_1','q03_1','q04_4','q05_4','q06_4','q07_1','q08_4','q09_1','q10_3']
        result=evaluate(self.quiz,{q['id']:a for q,a in zip(self.quiz['questions'],choices)})
        self.assertEqual(result['winner_id'],'P3')
        self.assertEqual(result['points']['P3'],12)
    def test_no_signal_is_neutral(self):
        choices=[4,1,1,1,1,1,1,1,1,1]
        r=evaluate(self.quiz,{q['id']:q['options'][j-1]['id'] for q,j in zip(self.quiz['questions'],choices)})
        self.assertEqual(r['winner_id'],'NEUTRAL')
        self.assertTrue(r['insufficient_evidence'])
    def test_reject_incomplete_and_fake_answers(self):
        with self.assertRaises(ValidationError): evaluate(self.quiz,{})
        with self.assertRaises(ValidationError): evaluate(self.quiz,{q['id']:'fake' for q in self.quiz['questions']})
    def test_public_config_removes_weights(self):
        out=public_config(self.quiz)
        self.assertNotIn('weights',out['questions'][0]['options'][0])
        self.assertNotIn('key_question',out['questions'][0])
    def test_tie_is_resolved_by_key_questions(self):
        q={'questions':[{'id':'a','key_question':True,'options':[{'id':'x','weights':{'P1':1,'P2':1}},{'id':'y','weights':{'P1':0,'P2':0}}]},
                        {'id':'b','options':[{'id':'x','weights':{'P1':1,'P2':1}},{'id':'y','weights':{'P1':0,'P2':0}}]}],
           'profiles':[{'id':'P1','priority':2},{'id':'P2','priority':1}]}
        r=evaluate(q,{'a':'x','b':'x'})
        self.assertEqual(r['winner_id'],'P2')
        self.assertEqual(r['tie_break'],'prioridade fixa')


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory()
        cls.port=18761
        env=dict(os.environ,QUIZ_DB_PATH=str(Path(cls.tmp.name)/'test.sqlite'),
                 QUIZ_ADMIN_PASSWORD='uma-senha-segura',QUIZ_PORT=str(cls.port))
        cls.server=subprocess.Popen([sys.executable,'app.py'],cwd=Path(__file__).parent,env=env,
                                    stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
        cls.base=f'http://127.0.0.1:{cls.port}'
        cls.opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(CookieJar()))
        for _ in range(60):
            try:
                cls.fetch('/api/auth/me');break
            except Exception:time.sleep(.1)
        else:raise RuntimeError('Servidor não iniciou.')
    @classmethod
    def tearDownClass(cls):
        cls.server.terminate();cls.server.wait(timeout=4);cls.tmp.cleanup()
    @classmethod
    def fetch(cls,path,body=None,method=None):
        data=json.dumps(body).encode() if body is not None else None
        req=urllib.request.Request(cls.base+path,data=data,method=method or ('POST' if data is not None else 'GET'),
            headers={'Content-Type':'application/json'})
        try:
            with cls.opener.open(req,timeout=5) as r:
                return r.status,json.load(r)
        except urllib.error.HTTPError as e:
            return e.code,json.load(e)
    def test_full_lifecycle(self):
        status,unauth=self.fetch('/api/admin/quizzes')
        self.assertEqual(status,401)
        status,_=self.fetch('/api/auth/login',{'password':'uma-senha-segura'})
        self.assertEqual(status,200)
        minimal_png=base64.b64encode(b'\x89PNG\r\n\x1a\n'+b'conteudo-de-teste').decode()
        status,media=self.fetch('/api/admin/upload',{'base64':'data:image/png;base64,'+minimal_png})
        self.assertEqual(status,200);self.assertTrue(media['url'].startswith('/uploads/'))
        status,_=self.fetch('/api/admin/upload',{'base64':base64.b64encode(b'<svg>teste</svg>').decode()})
        self.assertEqual(status,400)
        _,lst=self.fetch('/api/admin/quizzes')
        original=lst[0]['id'];self.assertEqual(lst[0]['status'],'rascunho')
        status,_=self.fetch('/api/public/padroes-relacionamentos')
        self.assertEqual(status,404)
        status,preview=self.fetch('/api/public/padroes-relacionamentos?preview=1')
        self.assertEqual(status,200);self.assertEqual(preview['quiz']['questions'][0]['id'],'q01')
        status,quiz=self.fetch('/api/admin/quizzes/'+original)
        data=quiz['draft']
        data['weights_reviewed']=True
        data['privacy_url']='https://example.org/privacidade'
        data['offer']['video_url']='https://example.org/masterclass.mp4'
        data['offer']['access_url']='https://example.org/acesso'
        for p in data['profiles']:p['video_url']='https://example.org/'+p['id']+'.mp4'
        status,_=self.fetch(f'/api/admin/quizzes/{original}/save',{'quiz':data});self.assertEqual(status,200)
        status,pub=self.fetch(f'/api/admin/quizzes/{original}/publish',{});self.assertEqual((status,pub['version']),(200,1))
        status,public=self.fetch('/api/public/padroes-relacionamentos')
        self.assertEqual(status,200);self.assertEqual(public['quiz']['profiles'],[])
        self.assertNotIn('weights',public['quiz']['questions'][0]['options'][0])
        status,view=self.fetch('/api/public/padroes-relacionamentos/view',{'origin':{'utm_source':'instagram'}})
        self.assertEqual(status,200)
        status,start=self.fetch('/api/public/padroes-relacionamentos/start',{'session_id':view['session_id']})
        self.assertEqual(status,200);sid=start['session_id']
        for q in data['questions']:
            status,_=self.fetch('/api/public/padroes-relacionamentos/answer',{'session_id':sid,'question_id':q['id'],'option_id':q['options'][-1]['id']})
            self.assertEqual(status,200)
        status,result=self.fetch('/api/public/padroes-relacionamentos/finish',{'session_id':sid})
        self.assertEqual(status,200)
        self.assertTrue(result['profile']['video_url'].startswith('https://example.org/'))
        status,_=self.fetch('/api/public/padroes-relacionamentos/capacity',{'session_id':sid,'capacity_id':'C2'})
        self.assertEqual(status,200)
        status,_=self.fetch('/api/public/padroes-relacionamentos/lead',{'session_id':sid,'name':'Pessoa Teste',
           'email':'pessoa@example.org','whatsapp':'71999999999','acknowledged_privacy':True,'marketing_optin':False})
        self.assertEqual(status,200)
        status,met=self.fetch('/api/admin/metrics/'+original)
        self.assertEqual((met['sessions'],met['completed'],met['leads']),(1,1,1))
        self.assertEqual(met['sources']['instagram'],1)
        self.assertEqual(met['starts'],1)
        # Mudanças em rascunho não afetam a versão já publicada.
        data['title']='NOVA CAPA AINDA NÃO PUBLICADA'
        data['slug']='teste-nova-capa'
        status,_=self.fetch(f'/api/admin/quizzes/{original}/save',{'quiz':data});self.assertEqual(status,200)
        _,still=self.fetch('/api/public/padroes-relacionamentos')
        self.assertNotEqual(still['quiz']['title'],data['title'])
        status,_=self.fetch('/api/public/teste-nova-capa')
        self.assertEqual(status,404)
        # Ao republicar, slug antigo segue resolvível como alias.
        status,_=self.fetch(f'/api/admin/quizzes/{original}/publish',{});self.assertEqual(status,200)
        status,alias=self.fetch('/api/public/padroes-relacionamentos');self.assertEqual(status,200)
        self.assertEqual(alias['quiz']['title'],data['title'])
        status,current=self.fetch('/api/public/teste-nova-capa');self.assertEqual(status,200)
        self.assertEqual(current['version'],2)

if __name__=='__main__':unittest.main(verbosity=2)
