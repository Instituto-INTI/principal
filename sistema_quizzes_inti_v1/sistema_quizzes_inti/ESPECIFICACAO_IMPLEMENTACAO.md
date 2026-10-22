# Especificação de implementação — INTI Quizzes v1.0

## Base documental

Fontes: `Sistem Quiz.pdf`; `REGRA MESTRE DE COPY PARA CRIAÇÃO DOS QUIZZES.pdf`; `SIMULAÇÃO QUIZ — PADRÕES NOS RELACIONAMENTOS.pdf`; `A arquitetura que eu usaria no sistema ficaria.pdf`; `ESPECIFICAÇÃO DO SISTEMA DE QUIZZES.pdf`.

## Responsabilidades separadas

- **Conteúdo:** textos de capa, perguntas, alternativas, perfis, vídeos, capacidades, expandir desejo, oferta, CTAs e mídia. Cada quiz é um documento JSON único no rascunho e uma cópia congelada na publicação.
- **Lógica:** `engine.evaluate` valida escolhas, soma os pesos não negativos por perfil, normaliza dividindo pelos máximos de cada perfil, resolve empate por score de perguntas-chave e, persistindo empate, por prioridade fixa. Um escore totalmente zerado produz resultado `NEUTRAL`.
- **Dados:** tabelas SQLite `quizzes`, `quiz_versions`, `slug_aliases`, `sessions`, `answers` e `events`. Cada sessão armazena a cópia da configuração publicada usada naquele preenchimento, preservando a interpretação mesmo após novas versões.

## Jornada do participante

1. Capa: headline, subheadline, imagem opcional, começar.
2. Quiz: uma pergunta por tela, múltiplas alternativas de **escolha única**.
3. Processamento e antecipação: resultado pronto, revelar.
4. Resultado: perfil predominante, frase de reconhecimento e vídeo específico.
5. Microcompromisso: quer mudar o padrão? Duas opções afirmativas rastreadas separadamente.
6. Capacidade desejada: qual benefício fortalecer? Armazena escolha.
7. Expansão: mensagem condicional referente à capacidade escolhida.
8. Convite: posiciona a masterclass como consequência do interesse declarado.
9. Vídeo da masterclass: vídeo geral configurado por URL.
10. Condição de acesso: gratuito, preço real, voucher opcional.
11. Formulário: nome, WhatsApp, e-mail e tratamento separado do consentimento de marketing; checkout externo por URL, quando configurado.
12. Confirmação: CTA de acesso.

## Regras de copy conservadas

O quiz deve partir de uma **situação indesejada**, apresentar **manifestações concretas e observáveis**, usar **uma ideia por tela** e diferenciar **comportamentos reais**, não apenas intensidades arbitrárias. O resultado descreve **padrão, não identidade nem diagnóstico**. O texto resumido serve de ponte ao vídeo. A jornada vende **capacidade desejada antes de oferecer a masterclass**. Promessas não devem sugerir controle sobre o comportamento da outra pessoa. Não é possível verificar automaticamente toda a qualidade da copy; essa revisão permanece editorial.

## Endpoints principais

| Método | Rota | Uso |
|---|---|---|
| POST | `/api/auth/login` | Sessão administrativa |
| GET | `/api/admin/quizzes` | Biblioteca |
| POST | `/api/admin/quizzes` | Criar quiz |
| GET | `/api/admin/quizzes/:id` | Ler rascunho |
| POST | `/api/admin/quizzes/:id/save` | Salvar rascunho |
| POST | `/api/admin/quizzes/:id/publish` | Publicar snapshot versionado |
| POST | `/api/admin/quizzes/:id/simulate` | Simular motor de resultado |
| POST | `/api/admin/quizzes/:id/duplicate` | Duplicar, sem dados pessoais |
| POST | `/api/admin/upload` | Upload de imagem PNG/JPG/WebP |
| GET | `/api/admin/metrics/:id` | Indicadores por quiz |
| GET | `/api/admin/export/:id` | Exportar sessões/leads (CSV) |
| GET | `/api/public/:slug` | Configuração pública sem pesos |
| POST | `/api/public/:slug/view` | Abrir sessão de visitante |
| POST | `/api/public/:slug/start` | Registrar início da jornada |
| POST | `/api/public/:slug/answer` | Salvar alternativa selecionada |
| POST | `/api/public/:slug/finish` | Calcular no servidor, registrar resultado e retornar perfil |
| POST | `/api/public/:slug/capacity` | Salvar capacidade desejada |
| POST | `/api/public/:slug/lead` | Salvar formulário após conclusão |

## Limites da primeira versão

A matriz de pesos completa **não foi especificada nos cinco arquivos**. A configuração do exemplo contém uma proposta provisória que não foi validada clínica ou estatisticamente. A publicação exige aceite explícito do administrador sobre os pesos e vídeos preenchidos. A plataforma não certifica a validade psicológica dos testes e não faz diagnóstico. Para produção com coleta de dados pessoais, há dependências de segurança, LGPD, serviço HTTPS, backup e integração de pagamentos descritas no README.
