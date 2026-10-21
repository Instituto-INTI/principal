# INTI · Studio de Quizzes

Plataforma própria para criar, editar, simular, publicar e medir quizzes, baseada nos cinco PDFs do projeto. **Não é apenas uma página de teste:** qualquer quiz novo é configurado no painel e publicado com endereço próprio.

## Começar no Windows

1. Extraia o arquivo ZIP inteiro para uma pasta.
2. Instale **Python 3.10 ou superior** se ainda não estiver instalado. Na instalação no Windows, marque **Add Python to PATH**.
3. Abra **`iniciar_windows.bat`**.
4. Digite uma senha administrativa **com pelo menos 8 caracteres**. Guarde a senha; precisará dela nas próximas execuções.
5. Abra `http://127.0.0.1:8000/admin` no navegador e faça login.
6. O quiz **“Padrões nos relacionamentos”** aparece automaticamente como **rascunho**. Clique em **Editar** e use **Visualizar** para conferir a jornada completa, inclusive no celular pelo modo responsivo do navegador.

**Importante:** se for reiniciar o servidor, utilize a mesma senha administrativa; uma senha diferente invalida os logins anteriores, mas não apaga o banco de dados. Para definir a senha permanentemente, crie uma variável de ambiente `QUIZ_ADMIN_PASSWORD` no sistema ou configure um gerenciador de segredos.

No macOS/Linux, execute `./iniciar_mac_linux.sh`. Também é possível usar no terminal:

```bash
export QUIZ_ADMIN_PASSWORD='escolha-uma-senha-com-pelo-menos-oito-caracteres'
python3 app.py
```

A plataforma funciona com **Python padrão + SQLite**. Não é necessário instalar Node, Flask ou dependências Python.

## Como criar e publicar um quiz

No painel, clique **Novo quiz**. Configure título, promessa, endereço (`slug`), perguntas, alternativas, pesos de cada alternativa nos padrões, resultados, vídeos, capacidades desejadas, convite, oferta e formulário. Salve, confira o **Simulador** e visualize todo o fluxo antes de publicar.

Para **publicar**, o sistema exige: matriz de pesos revisada e aprovada; algum peso positivo associado a cada padrão; URL de vídeo para cada padrão; vídeo da masterclass; URL de acesso/checkout; e link da política de privacidade. Isso impede que um rascunho incompleto seja liberado por engano. Com esses campos preenchidos, clique **Publicar**. O link público será `http://127.0.0.1:8000/quiz/SEU-SLUG` em execução local.

Alterações em rascunho **não modificam** a configuração publicada. Ao publicar novamente, o sistema cria outra versão e mantém os endereços antigos acessíveis, mesmo se o slug for alterado.

### O quiz de demonstração

Reproduz as dez perguntas, quatro padrões, sete capacidades e a sequência de telas do documento *SIMULAÇÃO QUIZ — PADRÕES NOS RELACIONAMENTOS*. Os textos vêm da simulação, e o padrão visual segue a referência com cartões interativos e foco em dispositivos móveis.

**A matriz completa de pesos não consta dos documentos.** Por isso, incluí uma **proposta provisória** e deixei `weights_reviewed = false`. Os pesos são apenas hipótese técnica para demonstrar o funcionamento. Revise e valide a matriz antes de publicar. A pergunta 10 expressa desejo de mudança e, no exemplo, **não influencia a classificação do padrão**. Se todas as respostas tiverem peso zero, o motor mostra um **resultado neutro**, sem atribuir uma fragilidade inexistente.

**Os vídeos e links de destino não foram inventados.** Os campos estão em branco e precisam ser preenchidos com mídias e URLs verdadeiras do projeto.

## Como aproveitar o ChatGPT para novos quizzes

A guia **Importar JSON** permite copiar a configuração inteira ou colar outra gerada no ChatGPT. O arquivo `quiz-exemplo.json` serve como modelo com IDs estáveis para perguntas (`q01`), opções (`q01_1`), padrões (`P1`) e capacidades (`C1`). Cada alternativa contém um objeto `weights`, por exemplo:

```json
{"id":"q03_4","text":"Sinto necessidade de agir para impedir o afastamento.","weights":{"P1":0,"P2":2,"P3":1,"P4":2}}
```

Depois de importar, confira a copy e a pontuação, **salve** e teste no simulador. O gerador automático por API de IA dentro do painel **não está incluído** nesta versão; a importação de JSON funciona sem cobrar tokens de API.

## O que já funciona

- Painel administrativo protegido por senha; biblioteca de quizzes, criação, edição e duplicação.
- Edição de headline, promessa, perguntas, alternativas, perfis, capacidades, cores, convites e ofertas.
- Upload de imagem PNG/JPG/WebP até 4 MB, ou uso de URL externa; vídeos por URL (MP4, YouTube ou Vimeo).
- Cartões com escolha única; resposta por toque e, para perguntas com 2 opções, suporte a gesto de deslizar.
- Motor de pontuação multidimensional **calculado no servidor**, normalização, desempate por pergunta-chave e prioridade fixa, resultado dominante e segundo padrão.
- Simulação das respostas no painel; vídeo específico exibido conforme o perfil vencedor.
- Jornada: capa → perguntas → antecipação → resultado/vídeo → microcompromisso → capacidade → expansão → convite → masterclass → preço/voucher → cadastro/checkout → confirmação.
- Ligação dinâmica entre capacidade escolhida e seu texto de expansão; configuração para habilitar ou ocultar etapas opcionais.
- Formulário de nome, WhatsApp e e-mail; separação entre ciência da política de privacidade e consentimento **opcional** para marketing.
- Banco de dados SQLite persistente com respostas, sessões, origem UTM, pontuações, resultado, desejo escolhido, lead e eventos.
- Indicadores simples de inícios, conclusões, leads, padrões e capacidades; exportação CSV; exclusão **de todos os dados de participantes de um quiz**, mediante confirmação.
- Publicação com versões imutáveis: editar o rascunho não altera a versão ativa.

## O que ainda não inclui

Esta é uma **primeira versão local para desenvolvimento e homologação**, e não um serviço pronto para receber dados pessoais na internet. Antes de campanhas reais, implemente hospedagem com **HTTPS**, proteção do banco e backups, gestão de usuários e permissões, limitação de tentativas de login, política efetiva de privacidade/retenção/exclusão individual, avaliação de segurança e observabilidade. O servidor Python integrado é voltado ao desenvolvimento local; o ambiente público precisa de infraestrutura adequada.

Também não inclui integração direta com Kiwify, WhatsApp, CRM, e-mail, pixel de anúncios ou provedores de IA; a confirmação de **compra efetivada** precisará vir de webhook/autenticação do processador de pagamento (não de eventos enviados pelo navegador). Vídeos incorporados por iframe registram quando o usuário solicita abrir o vídeo; **não** registram conclusão do vídeo sem integração com o player. O modo de quiz de múltipla escolha com várias respostas simultâneas, testes A/B, editor drag-and-drop e dashboards avançados ficam para a próxima fase.

**A publicação local não coloca o sistema online.** O domínio (por exemplo, `testes.institutointi.com`) dependerá de hospedagem e configuração DNS posteriores.

## Arquivos do projeto

| Arquivo | Finalidade |
|---|---|
| `app.py` | Servidor web, autenticação, APIs, SQLite, eventos e publicação |
| `engine.py` | Validação e cálculo determinístico dos resultados |
| `seed.py` | Quiz de demonstração e modelo de novo quiz |
| `static/admin.html` e `static/admin.js` | Painel administrativo |
| `static/quiz.html` e `static/quiz.js` | Jornada mobile-first do participante |
| `static/style.css` | Identidade visual e responsividade |
| `quiz-exemplo.json` | Configuração reutilizável do quiz da simulação |
| `testes.py` | Testes automatizados do motor e das APIs |
| `ESPECIFICACAO_IMPLEMENTACAO.md` | Alcance, escolhas técnicas e pendências |

O banco `quizzes.sqlite3` é criado automaticamente na pasta do projeto na primeira execução. A pasta `uploads` armazena imagens enviadas. **Faça backup dos dois** antes de atualizar, reinstalar ou mover o sistema.

Para executar os testes sem alterar o banco de trabalho:

```bash
python testes.py
```

Os testes utilizam um banco temporário e iniciam seu próprio servidor local de teste.
