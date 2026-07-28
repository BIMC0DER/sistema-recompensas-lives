---
name: implementar-sistema-de-recompensas
description: Guia passo a passo para colocar no ar o SEU próprio sistema de recompensas por presença em lives, feito para quem nunca programou. Baixa o projeto do GitHub, cria as contas necessárias (GitHub, Supabase, Vercel), personaliza as recompensas com a marca da pessoa e publica o site. Use quando o usuário pedir para implementar, instalar, configurar, publicar ou "colocar no ar" o sistema de recompensas / lista de presença.
---

# Implementar o Sistema de Recompensas (passo a passo para iniciantes)

Você vai guiar uma pessoa **leiga em programação** a colocar o sistema no ar, do zero até o site funcionando, personalizado com a marca dela.

**Repositório oficial do template (o guia usa este link na Etapa 1):**
`https://github.com/BIMC0DER/sistema-recompensas-lives`

## Como conduzir (regras do guia)

1. **UMA pergunta por vez.** Nunca faça duas perguntas na mesma mensagem. Pergunte, espere a resposta, aja sobre ela, e só então faça a próxima pergunta.
2. **Um passo por vez.** Nunca despeje a lista inteira de etapas. Explique o passo atual, espere a pessoa confirmar que concluiu, verifique quando possível, e só então avance.
3. **Linguagem simples.** A pessoa pode nunca ter ouvido falar de Git, deploy ou banco de dados. Antes de cada etapa, explique em 1-2 frases o que é a ferramenta e por que ela é necessária:
   - **GitHub** = onde o código do projeto fica guardado na nuvem.
   - **Supabase** = o banco de dados (onde ficam presenças, streaks e a senha de cada live).
   - **Vercel** = onde o site fica publicado na internet, de graça.
4. **Você faz o técnico, a pessoa faz o navegador.** Edições de código, comandos de terminal e arquivos: você executa. Criação de contas, cliques em sites e cópia de chaves: a pessoa faz, com você ditando exatamente onde clicar.
5. **Segurança — regras invioláveis:**
   - NUNCA peça senhas de contas (GitHub, Supabase, Vercel, e-mail). A pessoa digita senhas somente nos próprios sites (ou na janela de login que o Git abre no navegador).
   - As únicas credenciais que ela cola no chat são a **Project URL** e a **anon public key** do Supabase (são publicáveis por design — vão para o site final).
   - NUNCA peça nem aceite a **service_role key**. Se a pessoa colar por engano, avise para nunca compartilhar essa chave e siga usando apenas a anon.
   - Não guarde credenciais em nenhum arquivo além do `.env` (que já está no `.gitignore`).
6. **Celebre os marcos.** Cada etapa concluída é uma vitória para quem nunca programou. Confirme o sucesso antes de seguir.
7. **Se algo der errado**, consulte a seção *Solução de problemas* no fim deste guia antes de improvisar.

## Visão geral do destino (mostre à pessoa no início)

Ao final ela terá:
- Um site próprio (ex.: `minhaslives.vercel.app`) com o formulário de presença para a audiência.
- Um painel `/admin` onde ela configura cada live (número, senha do dia, abrir/fechar formulário) e vê o ranking.
- Recompensas automáticas por sequência de presença, com os marcos e prêmios **dela**.
- Custo: R$ 0 (planos gratuitos de GitHub, Supabase e Vercel são suficientes).

Exemplo real no ar: https://bimcoderlives.vercel.app (o sistema do BIM Coder que inspirou este template).

---

## ETAPA 0 — Preparar o computador

Verifique as ferramentas na máquina (rode você mesmo, sem perguntar):

```
git --version
node --version
```

- **Git ausente (Windows):** `winget install --id Git.Git -e`; (Mac): `xcode-select --install` ou Homebrew.
- **Node ausente (Windows):** `winget install OpenJS.NodeJS.LTS`; (Mac): instalador LTS de https://nodejs.org.
- Após instalar algo, a pessoa precisa fechar e reabrir o Claude Code/terminal para o comando ser encontrado.

Se o Git estiver sem identidade (`git config user.name` vazio), pergunte o nome dela, depois o e-mail, e configure com `git config --global`.

## ETAPA 1 — Conta no GitHub + obter o projeto

**Antes de perguntar qualquer coisa, detecte a situação:** se a pasta atual já contém o projeto (existe `package.json` com `"name": "sistema-recompensas-lives"` e a pasta `src/`), a pessoa já baixou o código (ZIP ou clone). Nesse caso pule para **1C** se não houver `.git`, ou direto para a Etapa 2 se `git remote -v` já mostrar um repositório dela.

### 1A — Conta

Pergunte: **"Você já tem conta no GitHub?"**

- **Sim** → peça para ela abrir https://github.com e conferir que está logada (avatar no canto superior direito). Siga para 1B.
- **Não** → oriente a criar em https://github.com/signup (e-mail, senha criada por ela, nome de usuário). Ela faz sozinha no navegador; você só orienta. Quando confirmar que está logada, siga para 1B.

> O "login no computador" (Git ↔ GitHub) acontece sozinho mais adiante: na primeira operação que precisar de permissão (clone de repo privado ou primeiro push), o Git abre uma janela do GitHub no navegador para ela autorizar. Avise que essa janela vai aparecer e que é normal.

### 1B — Criar o repositório dela a partir do template

1. Com ela logada no GitHub, mande abrir: `https://github.com/BIMC0DER/sistema-recompensas-lives`
2. Ela clica no botão verde **Use this template → Create a new repository**.
3. Nome sugerido: `meu-sistema-de-recompensas` (pode ser outro). Visibilidade: **Private** está ótimo (a Vercel acessa mesmo assim). Clica em **Create repository**.
4. Agora clone o repositório **dela** (pergunte o nome de usuário do GitHub para montar a URL, ou peça a URL da página que abriu):

```
git clone https://github.com/USUARIO/meu-sistema-de-recompensas.git
```

   Pergunte antes **em qual pasta** ela quer guardar o projeto (sugira Documentos) e clone lá. Se o repo for privado, a janela de login do GitHub abre no navegador — é o momento de "conectar o computador à conta".
5. Depois do clone, oriente: **abrir a pasta clonada no Claude Code** (File → Open Folder) e rodar `/implementar-sistema-de-recompensas` de novo, avisando que a Etapa 1 está feita — o guia retoma da Etapa 2. (Se preferir, você pode continuar na sessão atual trabalhando direto na pasta clonada.)

### 1C — Veio de ZIP (pasta sem `.git`)

1. `git init -b main`, `git add -A`, primeiro commit.
2. Oriente a criar um repositório **vazio** em https://github.com/new (nome sugerido: `meu-sistema-de-recompensas`, Private ok, **sem** marcar README/gitignore).
3. `git remote add origin <url do repo dela>` e `git push -u origin main` — a janela de login do GitHub abre no navegador no primeiro push.

## ETAPA 2 — Personalizar com a marca da pessoa

Deixe o projeto com a cara dela. Pergunte (**uma de cada vez**, na ordem):

1. **"Qual o nome do seu projeto/live?"** (ex.: "Lives da Ju", "Aulão de Terça"). Substitui "BIM Coder Lives" e "Live BIM Coder".
2. **"Qual assinatura você quer no rodapé?"** (nome/arroba/e-mail dela).
3. **"Quais serão as recompensas?"** — quantos marcos, em quais números de presenças seguidas, e qual o prêmio de cada um. Se ela não souber, sugira manter o padrão validado: 4 marcos em 5, 10, 15 e 25 lives (do brinde leve ao desconto forte — o mais valioso sempre por último). Os links de entrega podem ficar pendentes por enquanto.
4. **"Você tem um design system, manual de marca ou pelo menos uma cor principal?"** — peça o que existir: cor primária (hex, ex.: `#7F56D9`), fonte preferida, logo. Se não tiver nada, mantenha o padrão do template (violeta Untitled UI + fonte Inter), que já é bonito e testado. Não invente identidade: na dúvida, padrão.
5. **"Tema padrão: escuro ou claro?"** O site tem os dois (botão de alternar no topo); a pergunta é qual aparece primeiro pra quem nunca visitou. Hoje o padrão segue o sistema operacional do visitante — se a pessoa quiser forçar um lado (ex.: dark combina com live/tech; light com público corporativo), ajuste no código.

Com as respostas, edite:

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
1. No seed de `app_bimcoderlives_admin_emails`, troque o placeholder pelo **e-mail da pessoa** (pergunte: **"Qual e-mail você quer usar como login do painel admin?"** — sempre em minúsculo).
2. Na função `app_bimcoderlives_registrar_presenca`, reescreva os blocos `IF v_novo_streak >= N THEN ...` para refletir exatamente os marcos, `tipo` e `titulo` definidos em `rewards.ts`.

> ⚠️ **Invariante crítico:** os marcos e `tipo`s existem em DOIS lugares — `src/lib/rewards.ts` (exibição) e a RPC no SQL (desbloqueio real). Eles DEVEM ficar idênticos. Se a pessoa mudar as recompensas no futuro, os dois lados mudam juntos (no banco: rodar de novo só o `CREATE OR REPLACE FUNCTION`).

Não é preciso renomear as tabelas `app_bimcoderlives_*` — o prefixo é interno e invisível para a audiência.

Ao final, commite e pushe as personalizações (se for o primeiro push, avise que a janela de login do GitHub vai abrir no navegador).

## ETAPA 3 — Banco de dados no Supabase

1. Conta: https://supabase.com → "Start your project" → entrar **com o GitHub** (mais simples, sem senha nova).
2. Novo projeto: nome livre (ex.: `recompensas-lives`), região **South America (São Paulo)**, e uma *database password* que o próprio site sugere (orientar a salvar no gerenciador de senhas dela; não será usada no dia a dia).
3. Rodar o schema: menu lateral **SQL Editor** → New query → a pessoa cola o conteúdo de `supabase/migrations/setup_personalizado.sql` (abra o arquivo e entregue o conteúdo pronto para copiar) → **Run**. Deve terminar com "Success. No rows returned".
4. Criar o usuário admin: menu **Authentication → Users → Add user → Create new user** → e-mail = o mesmo colocado na whitelist da migration; senha forte criada pela pessoa; marcar **Auto Confirm User**.
5. Pegar as credenciais do app: **Project Settings → API** → a pessoa copia e cola no chat a **Project URL** e a **anon public** key (somente essas duas). Com elas, crie o arquivo `.env` na raiz (modelo em `.env.example`):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## ETAPA 4 — Testar no computador antes de publicar

1. `npm install` (só na primeira vez, demora alguns minutos).
2. Suba o site local (`npm run dev`, porta 5173 — se houver `.claude/launch.json`, use o preview do Claude Code) e abra no navegador.
3. Valide o visual da Etapa 2 com a pessoa: cores legíveis nos dois temas (claro e escuro), nada "apagado" no dark, nome e recompensas certos.
4. Roteiro de teste com a pessoa:
   - Abrir `/admin` → logar com o e-mail/senha criados na Etapa 3.4.
   - Configurar a **Live #1**: número 1, um título, uma senha de teste (ex.: `teste123`), status **aberto**.
   - Voltar à página inicial → preencher o formulário como se fosse um aluno (pode usar um e-mail fictício tipo `teste@teste.com`) → deve aparecer a tela de sucesso com streak = 1.
   - Conferir no `/admin` que o ranking mostra o registro.
5. Limpe o teste no SQL Editor:

```sql
DELETE FROM app_bimcoderlives_presencas WHERE email = 'teste@teste.com';
DELETE FROM app_bimcoderlives_ranking_usuarios WHERE email = 'teste@teste.com';
```

## ETAPA 5 — Publicar na Vercel

1. Conta: https://vercel.com/signup → **Continue with GitHub** (assim a Vercel já enxerga o repositório).
2. **Add New… → Project** → Import no repositório criado na Etapa 1. Framework: a Vercel detecta **Vite** sozinha; não mexa em build settings.
3. Antes de clicar em Deploy, abrir **Environment Variables** e adicionar as duas do `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy** → aguardar → abrir a URL gerada (ex.: `nome-do-repo.vercel.app`).
5. Repetir o roteiro de teste da Etapa 4 na URL pública (e limpar o teste de novo).
6. Opcional: domínio próprio em Settings → Domains (pode ficar para depois).

> A partir daqui, todo `git push` publica automaticamente uma nova versão. Se mudar uma variável de ambiente na Vercel, é preciso mandar um **Redeploy**.

## ETAPA 6 — Manual de operação (entregue no final)

Rotina de cada live:

1. **Antes da live:** entrar em `/admin` → configurar a live com o **número seguinte** ao da última (1, 2, 3, ... sem pular — é esse número que mantém o streak dos alunos), definir a **senha do dia** (troque a cada live!) e deixar **aberto**.
2. **Durante a live:** divulgar o link do site e falar a senha ao vivo (esse é o ponto: só ganha presença quem está assistindo). Boa prática: mostrar a senha na tela perto do fim.
3. **Depois da live:** fechar o formulário no `/admin`.
4. **Entrega das recompensas:** quando os materiais estiverem prontos, atualizar os `link` em `src/lib/rewards.ts` e dar push (a Vercel republica sozinha). O ranking no `/admin` mostra quem desbloqueou o quê.

Regras do streak (explique à pessoa): compareceu à live seguinte → +1; pulou alguma → volta para 1 (o `maior_streak` fica guardado); tentar registrar duas vezes na mesma live → bloqueado.

## Solução de problemas

| Sintoma | Causa provável | Correção |
|---|---|---|
| Clone/push pede login e falha | Janela do navegador fechada antes de autorizar | Rodar o comando de novo e concluir o login do GitHub na janela que abrir |
| Site abre com aviso de configuração / formulário não envia | `.env` ausente ou URL/key erradas | Conferir `.env` (local) ou Environment Variables + Redeploy (Vercel) |
| "Nenhuma live configurada" | Nunca criou live no `/admin` | Etapa 4.4 |
| "Formulário fechado" | `status_aberto` desligado | Abrir no `/admin` |
| "Senha incorreta" no login admin | Usuário não existe ou e-mail fora da whitelist | Conferir Authentication → Users e a tabela `app_bimcoderlives_admin_emails` |
| Login admin ok, mas sem permissão de salvar | E-mail logado ≠ e-mail da whitelist (maiúsculas contam: whitelist guarda minúsculo) | `INSERT INTO app_bimcoderlives_admin_emails (email) VALUES ('email@dominio.com');` |
| Mudou o `.env` e nada aconteceu | Vite não relê env em quente | Parar e rodar `npm run dev` de novo |
| Mudou cor no `tailwind.config.js` e a tela não atualizou | Vite não regenera classes do Tailwind em quente após mudar config | Parar e rodar `npm run dev` de novo |
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
