"""Exemplo fundamentado na SIMULAÇÃO QUIZ; pesos são hipóteses de implementação NÃO APROVADAS."""

def example_quiz():
    data = [
      ('Pensando nos seus últimos relacionamentos e envolvimentos, alguma situação parece se repetir?',
       ['Acabo me envolvendo com pessoas que não conseguem se entregar por inteiro.', 'No começo parece promissor, mas depois começo a receber cada vez menos.', 'Frequentemente sou eu quem se esforça mais para fazer a relação funcionar.', 'Não consigo perceber um padrão claro.'],
       [{'P1':2},{'P1':2},{'P2':2},{}]),
      ('Quando percebe que a outra pessoa está oferecendo menos do que você gostaria, o que costuma acontecer?',
       ['Consigo perceber e avaliar se ainda quero continuar.', 'Tento conversar e espero para ver se a situação melhora.', 'Começo a me esforçar mais para recuperar o que existia no início.', 'Acabo aceitando menos do que gostaria porque tenho medo de perder a relação.'],
       [{},{'P1':1},{'P2':2,'P1':1},{'P1':2,'P3':1}]),
      ('Quando alguém de quem você gosta começa a se afastar, como você costuma reagir?',
       ['Consigo respeitar o espaço e continuar vivendo minha vida.', 'Fico incomodada, mas tento não tirar conclusões precipitadas.', 'Começo a prestar atenção em cada mensagem, silêncio ou mudança de comportamento.', 'Sinto necessidade de fazer alguma coisa para impedir que essa pessoa se afaste.'],
       [{},{'P4':1},{'P4':2},{'P2':2,'P3':1,'P4':2}]),
      ('Quando alguma atitude da outra pessoa te machuca, o que acontece com mais frequência?',
       ['Consigo falar sobre o que senti de forma clara.', 'Falo, mas fico bastante preocupada com a reação da pessoa.', 'Acabo escolhendo muito as palavras para não criar conflito.', 'Muitas vezes prefiro ficar quieta para não colocar a relação em risco.'],
       [{},{'P4':1},{'P3':2},{'P3':3}]),
      ('Quando você coloca um limite e percebe que a outra pessoa não gostou…',
       ['Consigo manter o que decidi.', 'Fico desconfortável, mas tento sustentar meu limite.', 'Começo a me perguntar se estou sendo exigente demais.', 'Muitas vezes acabo voltando atrás para evitar afastamento ou conflito.'],
       [{},{'P3':1},{'P3':2},{'P3':3}]),
      ('Quando você gosta muito de alguém, o que costuma acontecer com a sua própria vida?',
       ['Continuo cuidando dos meus projetos, amizades e prioridades.', 'Faço alguns ajustes, mas procuro manter minha rotina.', 'Começo a deixar algumas coisas minhas para depois.', 'Aos poucos, minha vida começa a girar muito em torno da relação.'],
       [{},{},{'P3':2},{'P3':3}]),
      ('Quando sente que alguém importante pode estar perdendo o interesse por você…',
       ['Consigo observar a situação antes de agir.', 'Fico preocupada, mas tento continuar fazendo minhas coisas.', 'Começo a buscar sinais de que ainda está tudo bem.', 'Sinto vontade de fazer mais, agradar mais ou me adaptar para não perder a pessoa.'],
       [{},{'P4':1},{'P4':2},{'P2':3,'P3':1}]),
      ('Quando precisa tomar uma decisão que pode desagradar alguém importante para você…',
       ['Consigo ouvir a pessoa e ainda assim manter minha escolha.', 'Fico insegura, mas tento fazer o que considero melhor para mim.', 'Preciso de muita confirmação para sentir que estou fazendo a coisa certa.', 'Muitas vezes mudo minha decisão para evitar rejeição, culpa ou conflito.'],
       [{},{'P3':1},{'P4':1,'P3':1},{'P3':3}]),
      ('Quando recebe pouco de alguém por quem está emocionalmente envolvida, o que mais se parece com você?',
       ['Consigo reconhecer quando aquilo não é suficiente para mim.', 'Demoro um pouco, mas começo a questionar se quero continuar.', 'Fico presa à esperança de que a pessoa volte a ser como era no começo.', 'Acabo valorizando pequenos sinais de atenção porque tenho medo de perder completamente a relação.'],
       [{},{'P1':1},{'P1':3},{'P1':2,'P4':1}]),
      ('Pensando nos seus relacionamentos, qual dessas frases mais se aproxima do que você gostaria de mudar?',
       ['Quero escolher melhor com quem me envolvo.', 'Quero parar de tentar provar meu valor para ser escolhida.', 'Quero conseguir sustentar meus limites sem medo de perder alguém.', 'Quero parar de perder minha paz toda vez que sinto alguém se afastar.'],
       [{},{},{},{}]),
    ]
    profiles = [
      ('P1','Você tende a insistir onde recebe menos do que precisa','Suas respostas mostram que pode ser difícil se afastar quando ainda existe esperança de que a relação volte a ser aquilo que parecia no começo.','Quero te explicar por que esse padrão pode fazer você permanecer presa ao potencial de uma relação em vez de olhar para aquilo que ela realmente está oferecendo.'),
      ('P2','Você tende a se esforçar mais quando sente que pode perder alguém','Suas respostas mostram que a distância do outro pode fazer você aumentar ainda mais o seu investimento na relação.','Assista à minha explicação sobre por que tentar fazer mais pode acabar colocando você numa posição em que sente que precisa conquistar aquilo que gostaria de receber naturalmente.'),
      ('P3','Você tende a se abandonar para preservar o vínculo','Suas respostas mostram que o medo da reação do outro pode fazer você recuar em coisas importantes para você.','Quero te mostrar como esse padrão pode fazer você preservar a relação enquanto, aos poucos, deixa partes de você mesma para trás.'),
      ('P4','Você tende a perder a paz quando sente o outro se afastar','Suas respostas mostram que pequenas mudanças no comportamento de alguém podem mexer profundamente com o seu estado emocional.','Quero te explicar por que uma mensagem, um silêncio ou uma mudança de comportamento pode acabar ganhando tanto espaço dentro de você.'),
    ]
    capacities = [
      ('C1','Confiar mais em mim','Imagine tomar suas decisões sem precisar que alguém confirme o tempo todo se você está fazendo a coisa certa.'),
      ('C2','Desenvolver mais segurança emocional','Imagine conseguir gostar de alguém sem perder sua paz toda vez que essa pessoa muda, se afasta ou reage diferente do que você gostaria.'),
      ('C3','Sustentar meus limites sem culpa','Imagine conseguir dizer o que você pensa, colocar seus limites e continuar firme mesmo quando alguém não gosta da sua decisão.'),
      ('C4','Parar de me abandonar para ser escolhida','Imagine viver um relacionamento sem precisar deixar seus desejos, seus projetos e partes da sua vida para depois para manter alguém por perto.'),
      ('C5','Não perder minha paz quando alguém se afasta','Imagine perceber alguém mais distante sem deixar que isso controle o seu dia, suas decisões ou a forma como você se enxerga.'),
      ('C6','Escolher relacionamentos mais recíprocos','Imagine viver uma relação em que você não precise correr atrás, convencer ou fazer todo o esforço sozinha para sentir que existe interesse dos dois lados.'),
      ('C7','Voltar a colocar minha vida e meus projetos em primeiro plano','Imagine gostar de alguém e, ao mesmo tempo, continuar cuidando dos seus planos, amizades, projetos e da mulher que você quer se tornar.'),
    ]
    return {
      'slug':'padroes-relacionamentos', 'title':'Você está repetindo o mesmo padrão nos seus relacionamentos sem perceber?',
      'internal_name':'Padrões nos relacionamentos — exemplo',
      'subtitle':'Faça o teste e descubra o que pode estar impedindo você de viver o relacionamento que realmente merece.',
      'intro':'Perguntas rápidas sobre a forma como você escolhe, reage e se posiciona nos seus relacionamentos.',
      'cover_image':'', 'logo_url':'', 'start_cta':'COMEÇAR O TESTE', 'privacy_url':'',
      'weights_reviewed':False,
      'neutral_result':{'id':'NEUTRAL','title':'Não apareceu um padrão dominante claro','summary':'Pelas suas respostas, não há indícios suficientes para destacar um único padrão. Esse resultado também faz parte do autoconhecimento.','video_intro':'Seus comportamentos podem variar conforme a situação. Evite tirar conclusões definitivas a partir deste teste.','video_url':''},
      'questions':[{'id':f'q{i:02}', 'text':q, 'image_url':'', 'key_question':i in (3,4,5,6,7,8,9),
        'style':'choices','options':[{'id':f'q{i:02}_{j}', 'text':t, 'weights':w} for j,(t,w) in enumerate(zip(a,ws),start=1)]}
         for i,(q,a,ws) in enumerate(data, start=1)],
      'profiles':[{'id':pid,'title':title,'summary':summary,'video_intro':intro,'video_url':'','priority':i} for i,(pid,title,summary,intro) in enumerate(profiles,start=1)],
      'capacities':[{'id':cid,'title':title,'expansion':expanded} for cid,title,expanded in capacities],
      'offer':{'title':'A Coragem de se Escolher', 'invite_title':'Boa notícia',
       'invite_text':'Pelo seu resultado e pelo que você disse que gostaria de fortalecer, você liberou um convite para participar de A Coragem de se Escolher.',
       'intro_video_text':'Antes de liberar seu acesso, quero te explicar rapidamente o que é A Coragem de se Escolher e por que eu criei essa masterclass.',
       'video_url':'','free':True,'price':0,'reference_price':0,'voucher':'',
       'access_url':'','access_cta':'ACESSAR A MASTERCLASS', 'registration_cta':'LIBERAR MEU ACESSO GRATUITO'},
      'flow':{'microcommitment':True,'capacity':True,'expansion':True,'invite':True,'offer_video':True,'pricing':True,'registration':True},
      'theme':{'accent':'#934e64','bg':'#f7f1ed','surface':'#ffffff','text':'#342c32'},
      'consent_text':'Autorizo o uso dos meus dados para enviar o acesso solicitado, conforme a política de privacidade.',
      'marketing_text':'Quero receber outros conteúdos e convites do INTI (opcional).',
      'notice':'Este teste é uma ferramenta de reflexão e não constitui diagnóstico clínico.'
    }


def new_quiz():
    """Modelo simples, sem importar a copy específica de relacionamentos."""
    q=example_quiz()
    import secrets
    q['slug']='novo-quiz-'+secrets.token_hex(3)
    q['title']='Título do novo teste'
    q['internal_name']='Novo quiz'
    q['subtitle']='Escreva uma promessa específica e concreta.'
    q['intro']='Um teste curto para conhecer melhor suas escolhas.'
    q['questions']=[{'id':'q01','text':'Escreva aqui sua primeira pergunta.','image_url':'','image_prompt':'','style':'choices','key_question':True,'options':[{'id':'q01_a','text':'Primeira alternativa','weights':{'P1':0}}, {'id':'q01_b','text':'Segunda alternativa','weights':{'P1':1}}]}]
    q['profiles']=[{'id':'P1','title':'Nome do primeiro padrão','summary':'Descreva uma situação que a pessoa possa reconhecer.','video_intro':'Uma frase convidando a assistir ao vídeo.','video_url':'','priority':1}]
    q['capacities']=[{'id':'C1','title':'Uma melhoria que desejo desenvolver','expansion':'Imagine conseguir viver essa melhoria no dia a dia.'}]
    q['weights_reviewed']=False
    return q
