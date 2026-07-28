---
name: implementar-sistema-de-recompensas
description: Guia passo a passo para colocar no ar o SEU próprio sistema de recompensas por presença em lives, feito para quem nunca programou. O Claude faz o máximo sozinho (baixa o projeto, personaliza, testa, publica); a pessoa só cria as contas (GitHub, Supabase, Vercel) e clica onde ele mandar. Use quando o usuário pedir para implementar, instalar, configurar, publicar ou "colocar no ar" o sistema de recompensas / lista de presença.
---

# Implementar o Sistema de Recompensas (passo a passo para iniciantes)

Você vai guiar uma pessoa **leiga em programação** a colocar o sistema no ar, do zero até o site funcionando, personalizado com a marca dela.

**Repositório oficial do template (o guia clona este link na Etapa 1):**
`https://github.com/BIMC0DER/sistema-recompensas-lives`

## Como conduzir (regras do guia)

1. **UMA pergunta por vez.** Nunca faça duas perguntas na mesma mensagem. Pergunte, espere a resposta, aja sobre ela, e só então faça a próxima pergunta.
2. **Automatize ao máximo — o terminal é SEU, nunca da pessoa.** Tudo que dá pra fazer com comandos e arquivos, VOCÊ faz sem pedir: instalar ferramentas, clonar, criar/editar arquivos, commit, push, rodar o site, abrir páginas no navegador dela. NUNCA peça para a pessoa digitar um comando no terminal. Sobram para ela apenas as ações que exigem um humano: criar contas, digitar senhas nos próprios sites, clicar em botões que você ditar e copiar/colar o que você preparar.
3. **Facilite cada ida ao navegador:**
   - Abra você mesmo a página certa: `Start-Process "https://..."` (Windows) / `open "https://..."` (Mac).
   - Quando ela precisar colar algo num site (SQL, valores de configuração), deixe o texto pronto na área de transferência — `Set-Clipboard` (Windows) / `pbcopy` (Mac) — e diga: "já copiei, é só clicar no campo e apertar Ctrl+V".
4. **Um passo por vez.** Nunca despeje a lista inteira de etapas. Explique o passo atual, espere a pessoa confirmar que concluiu, verifique quando possível, e só então avance.
5. **Linguagem simples.** A pessoa pode nunca ter ouvido falar de Git, deploy ou banco de dados. Antes de cada etapa, explique em 1-2 frases o que é a ferramenta e por que ela é necessária:
   - **GitHub** = onde o código do projeto fica guardado na nuvem.
   - **Supabase** = o banco de dados (onde ficam presenças, streaks e a senha de cada live).
   - **Vercel** = onde o site fica publicado na internet, de graça.
6. **Segurança — regras invioláveis:**
   - NUNCA peça senhas de contas (GitHub, Supabase, Vercel, e-mail). A pessoa digita senhas somente nos próprios sites (ou na janela de login que o Git abre no navegador).
   - As únicas credenciais que ela cola no chat são a **Project URL** e a **anon public key** do Supabase (são publicáveis por design — vão para o site final).
   - NUNCA peça nem aceite a **service_role key**. Se a pessoa colar por engano, avise para nunca compartilhar essa chave e siga usando apenas a anon.
   - Não guarde credenciais em nenhum arquivo além do `.env` (que já está no `.gitignore`).
7. **Celebre os marcos.** Cada etapa concluída é uma vitória para quem nunca programou. Confirme o sucesso antes de seguir.
8. **Se algo der errado**, consulte a seção *Solução de problemas* no fim deste guia antes de improvisar.

## Visão geral do destino (mostre à pessoa no início)

Ao final ela terá:
- Um site próprio (ex.: `minhaslives.vercel.app`) com o formulário de presença para a audiência.
- Um painel `/admin` onde ela configura cada live (número, senha do dia, abrir/fechar formulário) e vê o ranking.
- Recompensas automáticas por sequência de presença, com os marcos e prêmios **dela**.
- Custo: R$ 0 (planos gratuitos de GitHub, Supabase e Vercel são suficientes).

Exemplo real no ar: https://bimcoderlives.vercel.app (o sistema do BIM Coder que inspirou este template).

A ordem foi pensada para a pessoa **ver o site funcionando na máquina dela o quanto antes** — contas só entram no fim, na hora de publicar.

---

## ETAPA 0 — Preparar o computador (você faz tudo)

Verifique as ferramentas (rode você mesmo, sem perguntar):

```
git --version
node --version
```

- **Git ausente:** instale você mesmo — Windows: `winget install --id Git.Git -e`; Mac: Homebrew ou `xcode-select --install`.
- **Node ausente:** Windows: `winget install OpenJS.NodeJS.LTS`; Mac: `brew install node` (ou orientar o instalador LTS de https://nodejs.org se não houver brew).
- Após instalar, o comando pode só aparecer em um terminal novo — reinicie o shell (ou peça para a pessoa fechar e reabrir o Claude Code, única exceção em que ela toca no app).

Se o Git estiver sem identidade (`git config user.name` vazio), pergunte o nome dela, depois o e-mail, e configure com `git config --global`.

## ETAPA 1 — Baixar o projeto (você faz tudo)

**Detecção primeiro:** se a pasta atual já contém o projeto (existe `package.json` com `"name": "sistema-recompensas-lives"` e a pasta `src/`), pule o clone — apenas garanta o `git init` + commit inicial se não houver `.git`, e vá para a Etapa 2.

Senão, faça uma única pergunta: **"Em qual pasta do computador você quer guardar o projeto?"** (sugira Documentos). Depois, você mesmo:

1. Clone o template (é público, não precisa de conta nenhuma):

```
git clone https://github.com/BIMC0DER/sistema-recompensas-lives.git "<pasta escolhida>\meu-sistema-de-recompensas"
```

2. Zere o histórico do template para o projeto nascer como **dela**: apague a pasta `.git` do clone, rode `git init -b main`, `git add -A` e um commit inicial ("Meu sistema de recompensas").
3. Continue a sessão trabalhando direto nessa pasta (use caminhos absolutos). Ao final do processo, sugira que ela passe a abrir essa pasta no Claude Code (File → Open Folder) — a skill vem junto no projeto.

## ETAPA 2 — Personalizar com a marca da pessoa

Deixe o projeto com a cara dela. Pergunte (**uma de cada vez**, na ordem):

1. **"Qual o nome do seu projeto/live?"** (ex.: "Lives da Ju", "Aulão de Terça"). Substitui "BIM Coder Lives" e "Live BIM Coder".
2. **"Qual assinatura você quer no rodapé?"** (nome/arroba/e-mail dela).
3. **"Quais serão as recompensas?"** — quantos marcos, em quais números de presenças seguidas, e qual o prêmio de cada um. Se ela não souber, sugira manter o padrão validado: 4 marcos em 5, 10, 15 e 25 lives (do brinde leve ao desconto forte — o mais valioso sempre por último). Os links de entrega podem ficar pendentes por enquanto.
4. **"Você tem um design system, manual de marca ou pelo menos uma cor principal?"** — peça o que existir: cor primária (hex, ex.: `#7F56D9`), fonte preferida, logo. Se não tiver nada, mantenha o padrão do template (violeta Untitled UI + fonte Inter), que já é bonito e testado. Não invente identidade: na dúvida, padrão.
5. **"Tema padrão: escuro ou claro?"** O site tem os dois (botão de alternar no topo); a pergunta é qual aparece primeiro pra quem nunca visitou. Hoje o padrão segue o sistema operacional do visitante — se a pessoa quiser forçar um lado (ex.: dark combina com live/tech; light com público corporativo), ajuste no código.
6. **"Qual e-mail você quer usar como login do painel admin?"** (sempre em minúsculo — vai para a whitelist do banco).

Com as respostas, edite você mesmo:

| O quê | Onde |
|---|---|
| Títulos, subtítulo e rodapé | `src/pages/StudentPage.tsx` e `index.html` (`<title>`) |
| Lista de recompensas do front (marco, título, descrição, link, ícone) | `src/lib/rewards.ts` (array `REWARDS`) |
| Tipos das recompensas | `src/types/index.ts` (union `TipoRecompensa`) — mantenha os `tipo` idênticos aos usados em `rewards.ts` e no SQL |
| Lógica de desbloqueio no banco | gere `supabase/migrations/setup_personalizado.sql` (ver abaixo) |
| Cor da marca | `tailwind.config.js` → escala `brand` (25–950): gere os 12 tons a partir do hex da pessoa (600 ≈ a cor principal; 25–100 bem claros p/ fundos; 700+ escuros p/ hover/contraste). Verifique legibilidade: texto branco sobre `brand-600` precisa contrastar |
| Fonte | `index.html` (link do Google Fonts) + `tailwind.config.js` → `fontFamily.sans`. Só trocar se a pessoa pediu; Inter é o padrão |
| Tema padrão (dark/light) | `src/hooks/useTheme.ts` → em `getInitial()`, troque o fallback (a linha do `matchMedia`) por `return 'dark';` ou `return 'light';`. O toggle continua funcionando e a escolha do visitante fica salva no navegador |

**Gerando `setup_personalizado.sql`:** copie `supabase/migrations/001_initial_schema.sql` e ajuste:
1. No seed de `app_bimcoderlives_admin_emails`, troque o placeholder pelo e-mail admin da pergunta 6.
2. Na função `app_bimcoderlives_registrar_presenca`, reescreva os blocos `IF v_novo_streak >= N THEN ...` para refletir exatamente os marcos, `tipo` e `titulo` definidos em `rewards.ts`.

> ⚠️ **Invariante crítico:** os marcos e `tipo`s existem em DOIS lugares — `src/lib/rewards.ts` (exibição) e a RPC no SQL (desbloqueio real). Eles DEVEM ficar idênticos. Se a pessoa mudar as recompensas no futuro, os dois lados mudam juntos (no banco: rodar de novo só o `CREATE OR REPLACE FUNCTION`).

Não é preciso renomear as tabelas `app_bimcoderlives_*` — o prefixo é interno e invisível para a audiência.

Ao final, commite as personalizações.

## ETAPA 3 — Banco de dados no Supabase

Aqui a pessoa entra em cena (contas e cliques); você prepara tudo e abre as páginas pra ela.

1. Abra você mesmo `https://supabase.com` no navegador dela. Ela clica em "Start your project" e entra criando conta (pode usar o e-mail dela; se já tiver GitHub, "Continue with GitHub" é o caminho mais curto).
2. Novo projeto: nome livre (ex.: `recompensas-lives`), região **South America (São Paulo)**, e uma *database password* que o próprio site sugere (orientar a salvar no gerenciador de senhas dela; não será usada no dia a dia).
3. Rodar o schema: **copie você mesmo o conteúdo de `setup_personalizado.sql` para a área de transferência** (`Set-Clipboard`) e oriente: menu lateral **SQL Editor** → New query → Ctrl+V → **Run**. Deve terminar com "Success. No rows returned".
4. Criar o usuário admin: menu **Authentication → Users → Add user → Create new user** → e-mail = o da whitelist (deixe copiado no Ctrl+V também); senha forte criada pela pessoa; marcar **Auto Confirm User**.
5. Pegar as credenciais do app: **Project Settings → API** → a pessoa copia e cola **no chat** a **Project URL** e a **anon public** key (somente essas duas). Com elas, crie você o arquivo `.env` na raiz (modelo em `.env.example`):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## ETAPA 4 — Testar no computador antes de publicar

Você faz tudo; a pessoa só olha e clica no site.

1. Rode `npm install` (só na primeira vez, demora alguns minutos — avise).
2. Suba o site local (`npm run dev`, porta 5173 — se houver `.claude/launch.json`, use o preview do Claude Code) e **abra você mesmo** `http://localhost:5173` no navegador dela.
3. Valide o visual da Etapa 2 com a pessoa: cores legíveis nos dois temas (claro e escuro), nada "apagado" no dark, nome e recompensas certos.
4. Roteiro de teste com a pessoa:
   - Abrir `/admin` (abra você a URL) → ela loga com o e-mail/senha criados na Etapa 3.4.
   - Configurar a **Live #1**: número 1, um título, uma senha de teste (ex.: `teste123`), status **aberto**.
   - Voltar à página inicial → preencher o formulário como se fosse um aluno (pode usar um e-mail fictício tipo `teste@teste.com`) → deve aparecer a tela de sucesso com streak = 1.
   - Conferir no `/admin` que o ranking mostra o registro.
5. Limpe o teste: deixe este SQL no Ctrl+V dela e oriente a rodar no SQL Editor:

```sql
DELETE FROM app_bimcoderlives_presencas WHERE email = 'teste@teste.com';
DELETE FROM app_bimcoderlives_ranking_usuarios WHERE email = 'teste@teste.com';
```

## ETAPA 5 — Conta no GitHub + subir o projeto

Pergunte: **"Você já tem conta no GitHub?"**

- **Não** → abra você mesmo `https://github.com/signup` e oriente (e-mail, senha criada por ela, nome de usuário). Espere confirmar.
- **Sim** → abra `https://github.com` e peça pra conferir que está logada (avatar no canto superior direito).

Depois:

1. Abra você mesmo `https://github.com/new` e dite: **Repository name** `meu-sistema-de-recompensas` (pode ser outro), visibilidade **Private** (a Vercel acessa mesmo assim), e **NÃO** marcar nenhuma opção de README/gitignore. Ela clica em **Create repository**.
2. Pergunte o **nome de usuário** do GitHub dela (ou peça pra colar a URL da página que abriu) e rode você mesmo:

```
git remote add origin https://github.com/USUARIO/meu-sistema-de-recompensas.git
git push -u origin main
```

3. **Avise antes do push:** uma janela do GitHub vai abrir no navegador pedindo autorização — é o Git conectando o computador à conta dela. Ela só clica em **Authorize/Sign in**; se a janela fechar sem concluir, rode o push de novo.

## ETAPA 6 — Publicar na Vercel

1. Abra você mesmo `https://vercel.com/signup` → ela escolhe **Continue with GitHub** (assim a Vercel já enxerga o repositório) e autoriza.
2. Oriente: **Add New… → Project** → Import no repositório criado na Etapa 5. Framework: a Vercel detecta **Vite** sozinha; não mexa em build settings.
3. Antes de clicar em Deploy, abrir **Environment Variables** e adicionar as duas variáveis do `.env`. Facilite: deixe no Ctrl+V dela **um valor de cada vez** (primeiro o nome `VITE_SUPABASE_URL`, depois o valor; depois `VITE_SUPABASE_ANON_KEY` e o valor), confirmando cada colada.
4. **Deploy** → aguardar → abra a URL gerada (ex.: `nome-do-repo.vercel.app`) no navegador dela.
5. Repetir o roteiro de teste da Etapa 4 na URL pública (e limpar o teste de novo).
6. Opcional: domínio próprio em Settings → Domains (pode ficar para depois).

> A partir daqui, todo `git push` publica automaticamente uma nova versão — e quem faz push é você, quando ela pedir mudanças. Se mudar uma variável de ambiente na Vercel, é preciso mandar um **Redeploy**.

## ETAPA 7 — Manual de operação (entregue no final)

Rotina de cada live:

1. **Antes da live:** entrar em `/admin` → configurar a live com o **número seguinte** ao da última (1, 2, 3, ... sem pular — é esse número que mantém o streak dos alunos), definir a **senha do dia** (troque a cada live!) e deixar **aberto**.
2. **Durante a live:** divulgar o link do site e falar a senha ao vivo (esse é o ponto: só ganha presença quem está assistindo). Boa prática: mostrar a senha na tela perto do fim.
3. **Depois da live:** fechar o formulário no `/admin`.
4. **Entrega das recompensas:** quando os materiais estiverem prontos, ela abre o projeto no Claude Code e pede: "atualiza os links das recompensas" — o Claude edita `src/lib/rewards.ts` e dá push (a Vercel republica sozinha). O ranking no `/admin` mostra quem desbloqueou o quê.

Regras do streak (explique à pessoa): compareceu à live seguinte → +1; pulou alguma → volta para 1 (o `maior_streak` fica guardado); tentar registrar duas vezes na mesma live → bloqueado.

## Solução de problemas

| Sintoma | Causa provável | Correção |
|---|---|---|
| Push pede login e falha | Janela do navegador fechada antes de autorizar | Rodar o push de novo e concluir o login do GitHub na janela que abrir |
| Site abre com aviso de configuração / formulário não envia | `.env` ausente ou URL/key erradas | Conferir `.env` (local) ou Environment Variables + Redeploy (Vercel) |
| "Nenhuma live configurada" | Nunca criou live no `/admin` | Etapa 4.4 |
| "Formulário fechado" | `status_aberto` desligado | Abrir no `/admin` |
| "Senha incorreta" no login admin | Usuário não existe ou e-mail fora da whitelist | Conferir Authentication → Users e a tabela `app_bimcoderlives_admin_emails` |
| Login admin ok, mas sem permissão de salvar | E-mail logado ≠ e-mail da whitelist (maiúsculas contam: whitelist guarda minúsculo) | `INSERT INTO app_bimcoderlives_admin_emails (email) VALUES ('email@dominio.com');` |
| Mudou o `.env` e nada aconteceu | Vite não relê env em quente | Parar e rodar `npm run dev` de novo |
| Mudou cor no `tailwind.config.js` e a tela não atualizou | Vite não regenera classes do Tailwind em quente após mudar config | Parar e rodar `npm run dev` de novo |
| `winget` não encontrado (Windows antigo) | App Installer ausente | Orientar instalação manual: Git em https://git-scm.com e Node LTS em https://nodejs.org |
| Streak não somou | `id_live` não é o anterior + 1 | Corrigir a numeração no `/admin` |
| Recompensa aparece no site mas não desbloqueia (ou vice-versa) | `rewards.ts` e RPC dessincronizados | Ver invariante da Etapa 2; recriar a função no SQL Editor |

## Checklist final (confirme item a item com a pessoa)

- [ ] Site personalizado com nome/marca dela (cores, fonte e tema padrão escolhidos)
- [ ] Recompensas e marcos dela (front + SQL idênticos)
- [ ] Repositório próprio no GitHub com push funcionando
- [ ] Migration rodada no Supabase + usuário admin criado
- [ ] Teste completo local **e** em produção (e dados de teste apagados)
- [ ] Ela sabe operar a rotina da live (número sequencial, senha do dia, abrir/fechar)
- [ ] Links das recompensas preenchidos (ou anotados como pendência)
- [ ] Ela sabe que o projeto fica na pasta escolhida na Etapa 1 e que é só abrir no Claude Code pra pedir mudanças
