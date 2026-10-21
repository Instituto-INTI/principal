"""Motor determinístico: nenhuma interpretação por IA das respostas dos visitantes."""
from __future__ import annotations
from math import isfinite
import re
from urllib.parse import urlparse

SLUG_RE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')

class ValidationError(ValueError):
    pass


def validate_quiz(quiz, publishing=False):
    problems = []
    if not isinstance(quiz, dict):
        return ['O quiz precisa ser um objeto JSON.']
    if not str(quiz.get('title', '')).strip():
        problems.append('Defina um título público.')
    if not SLUG_RE.fullmatch(str(quiz.get('slug', ''))):
        problems.append('Slug inválido: use letras minúsculas, números e hífens.')
    profiles = quiz.get('profiles', [])
    questions = quiz.get('questions', [])
    caps = quiz.get('capacities', [])
    if not isinstance(profiles, list) or not (1 <= len(profiles) <= 30):
        problems.append('Cadastre de 1 a 30 perfis.')
        profiles = []
    pids = [p.get('id') for p in profiles if isinstance(p, dict)]
    if len(pids) != len(profiles) or len(set(pids)) != len(pids) or not all(isinstance(p, str) and p for p in pids):
        problems.append('Cada perfil precisa ter um ID único.')
    if not isinstance(questions, list) or not (1 <= len(questions) <= 60):
        problems.append('Cadastre de 1 a 60 perguntas.')
        questions = []
    qids = []
    for q in questions:
        if not isinstance(q, dict):
            problems.append('Pergunta inválida.'); continue
        qid = q.get('id')
        qids.append(qid)
        if not isinstance(qid, str) or not qid or not q.get('text'):
            problems.append('Pergunta sem ID ou texto.')
        opts = q.get('options', [])
        if not isinstance(opts, list) or not (2 <= len(opts) <= 8):
            problems.append(f'{qid}: use de 2 a 8 opções.'); continue
        oids = [o.get('id') for o in opts if isinstance(o, dict)]
        if len(oids) != len(opts) or len(set(oids)) != len(oids):
            problems.append(f'{qid}: IDs de opções repetidos.')
        for opt in opts:
            if not isinstance(opt, dict) or not str(opt.get('text', '')).strip():
                problems.append(f'{qid}: opção sem texto.'); continue
            weights = opt.get('weights', {})
            if not isinstance(weights, dict):
                problems.append(f'{qid}: pesos inválidos.'); continue
            for pid, weight in weights.items():
                if pid not in pids or isinstance(weight, bool) or not isinstance(weight, (float, int)) or not isfinite(weight) or not (0 <= weight <= 100):
                    problems.append(f'{qid}: peso inválido para {pid}.')
    if len(set(qids)) != len(qids):
        problems.append('IDs de perguntas repetidos.')
    for required in ('offer','flow','theme'):
        if not isinstance(quiz.get(required),dict):
            problems.append(f'Configuração {required} não encontrada.')
    if not isinstance(caps, list):
        problems.append('Capacidades precisam ser uma lista.'); caps = []
    cids = [c.get('id') for c in caps if isinstance(c, dict)]
    if len(cids) != len(caps) or len(set(cids)) != len(cids):
        problems.append('IDs de capacidades repetidos.')
    if publishing:
        def https_url(value):
            try:
                u=urlparse(str(value))
                return u.scheme=='https' and bool(u.netloc)
            except (TypeError,ValueError):return False
        used={pid:False for pid in pids}
        for question in questions:
            for opt in question.get('options',[]):
                for pid,weight in opt.get('weights',{}).items():
                    if pid in used and isinstance(weight,(float,int)) and not isinstance(weight,bool) and weight>0: used[pid]=True
        for pid,seen in used.items():
            if not seen:problems.append(f'Perfil {pid} não recebe pontos de nenhuma alternativa.')
        if not quiz.get('weights_reviewed'):
            problems.append('A matriz de pesos precisa ser revisada e aprovada.')
        if not caps:
            problems.append('Cadastre ao menos uma capacidade desejada.')
        for p in profiles:
            if not p.get('title') or not p.get('summary') or not https_url(p.get('video_url')):
                problems.append(f'Perfil {p.get("id", "?")}: inclua nome, frase e URL HTTPS do vídeo.')
        offer = quiz.get('offer') or {}
        if not https_url(offer.get('video_url')):
            problems.append('Insira a URL HTTPS do vídeo geral da masterclass.')
        if not https_url(offer.get('access_url')):
            problems.append('Insira a URL HTTPS de acesso ou checkout na oferta.')
        if not https_url(quiz.get('privacy_url')):
            problems.append('Insira a URL HTTPS da política de privacidade.')
    return problems


def evaluate(quiz, answers):
    """answers: {question_id: option_id}. Retorna scores e regra de desempate."""
    qs = quiz['questions']; profiles = quiz['profiles']
    if not isinstance(answers, dict) or set(answers) != {q['id'] for q in qs}:
        raise ValidationError('Responda todas as perguntas antes de concluir.')
    points = {p['id']: 0.0 for p in profiles}
    maximum = {p['id']: 0.0 for p in profiles}
    key_points = {p['id']: 0.0 for p in profiles}
    for q in qs:
        opts = q['options']
        selected = next((o for o in opts if o['id'] == answers[q['id']]), None)
        if selected is None:
            raise ValidationError(f'Opção inválida na pergunta {q["id"]}.')
        for p in profiles:
            pid = p['id']
            maximum[pid] += max((float(o.get('weights', {}).get(pid, 0)) for o in opts), default=0)
            weight = float(selected.get('weights', {}).get(pid, 0))
            points[pid] += weight
            if q.get('key_question'):
                key_points[pid] += weight
    normalized = {pid: round(points[pid] / maximum[pid], 6) if maximum[pid] else 0 for pid in points}
    ranked = sorted(profiles, key=lambda p: (-normalized[p['id']], -key_points[p['id']], int(p.get('priority', 999)), p['id']))
    insufficient = all(points[pid] == 0 for pid in points)
    winner = 'NEUTRAL' if insufficient else ranked[0]['id']
    second = ranked[1]['id'] if len(ranked) > 1 and not insufficient else None
    same = [] if insufficient else [p for p in profiles if normalized[p['id']] == normalized[winner]]
    tie_break = 'maior pontuação normalizada'
    if insufficient: tie_break = 'evidência insuficiente: nenhum ponto atribuído'
    if len(same) > 1:
        highest_key = max(key_points[p['id']] for p in same)
        final = [p for p in same if key_points[p['id']] == highest_key]
        tie_break = 'perguntas-chave' if len(final) == 1 else 'prioridade fixa'
    intensity = 'não aplicável' if insufficient else ('baixa' if normalized[winner] < 0.34 else 'moderada' if normalized[winner] < 0.67 else 'alta')
    return {'insufficient_evidence': insufficient, 'winner_id': winner, 'second_id': second, 'points': points, 'max_possible': maximum,
            'normalized': normalized, 'key_points': key_points, 'tie_break': tie_break, 'intensity': intensity}


def public_config(quiz):
    """Nunca expor matriz de pesos ao navegador participante."""
    import copy
    public = copy.deepcopy(quiz)
    for q in public.get('questions', []):
        q.pop('key_question', None)
        for o in q.get('options', []):
            o.pop('weights', None)
    public.pop('weights_reviewed', None)
    for p in public.get('profiles', []):
        p.pop('priority', None)
    return public
