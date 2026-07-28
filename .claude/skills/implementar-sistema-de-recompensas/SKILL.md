---
name: implementar-sistema-de-recompensas
description: Guia passo a passo para colocar no ar o SEU próprio sistema de recompensas por presença em lives (este projeto), feito para quem nunca programou. Cria conta no GitHub, Supabase e Vercel, personaliza as recompensas com a marca da pessoa e publica o site. Use quando o usuário pedir para implementar, instalar, configurar, publicar ou "colocar no ar" o sistema de recompensas / lista de presença.
---

# Implementar o Sistema de Recompensas (passo a passo para iniciantes)

Você vai guiar uma pessoa **leiga em programação** a colocar este projeto no ar, do zero até o site funcionando, personalizado com a marca dela.

## Como conduzir (regras do guia)

1. **Um passo por vez.** Nunca despeje a lista inteira de etapas. Explique o passo atual, espere a pessoa confirmar que concluiu, verifique quando possível, e só então avance.
2. **Linguagem simples.** A pessoa pode nunca ter ouvido falar de Git, deploy ou banco de dados. Antes de cada etapa, explique em 1-2 frases o que é a ferramenta e por que ela é necessária:
   - **GitHub** = onde o código do projeto fica guardado na nuvem.
   - **Supabase** = o banco de dados (onde ficam presenças, streaks e a senha de cada live).
   - **Vercel** = onde o site fica publicado na internet, de graça.
3. **Você faz o técnico, a pessoa faz o navegador.** Edições de código, comandos de terminal e arquivos: você executa. Criação de contas, cliques em sites e cópia de chaves: a pessoa faz, com você ditando exatamente onde clicar.
4. **Segurança — regras invioláveis:**
   - NUNCA peça senhas de contas (GitHub, Supabase, Vercel, e-mail). A pessoa digita senhas somente nos próprios sites.
   - As únicas credenciais que ela cola no chat são a **Project URL** e a **anon public key** do Supabase (são publicáveis por design — vão para o site final).
   - NUNCA peça nem aceite a **service_role key**. Se a pessoa colar por engano, avise para nunca compartilhar essa chave e siga usando apenas a anon.
   - Não guarde credenciais em nenhum arquivo além do `.env` (que já está no `.gitignore`).
5. **Celebre os marcos.** Cada etapa concluída é uma vitória para quem nunca programou. Confirme o sucesso antes de seguir.
6. **Se algo der errado**, consulte a seção *Solução de problemas* no fim deste guia antes de improvisar.

## Visão geral do destino (mostre à pessoa no início)

Ao final ela terá:
- Um site próprio (ex.: `minhaslives.vercel.app`) com o formulário de presença para a audiência.
- Um painel `/admin` onde ela configura cada live (número, senha do dia, abrir/fechar formulário) e vê o ranking.
- Recompensas automáticas por sequência de presença, com os marcos e prêmios **dela**.
- Custo: R$ 0 (planos gratuitos de GitHub, Supabase e Vercel são suficientes).

Exemplo real no ar: https://bimcoderlives.vercel.app (o sistema do BIM Coder que inspirou este template).

---

## ETAPA 0 — Diagnóstico

Descubra o ponto de partida. Pergunte (uma coisa de cada vez, em linguagem simples):

1. Como a pessoa obteve este projeto: baixou o ZIP do GitHub ou clonou com Git? (Se você consegue rodar `git log` na pasta e há histórico, foi clone/template; se `git status` falhar, foi ZIP.)
2. Ela já tem conta no GitHub? E no Supabase ou Vercel? (Provavelmente não — tudo será criado no caminho.)

Verifique as ferramentas na máquina (rode você mesmo):

```
git --version
node --version
```

- **Git ausente (Windows):** `winget install --id Git.Git -e`; (Mac): `xcode-select --install` ou Homebrew. Depois configure nome e e-mail: `git config --global user.name "Nome"` e `git config --global user.email "email@exemplo.com"` (pergunte os valores à pessoa).
- **Node ausente (Windows):** `winget install OpenJS.NodeJS.LTS`; (Mac): instalador LTS de https://nodejs.org. Após instalar, a pessoa precisa fechar e reabrir o Claude Code/terminal para o comando ser encontrado.

## ETAPA 1 — Personalizar com a marca da pessoa

Antes de qualquer conta, deixe o projeto com a cara dela. Pergunte:

1. **Nome do projeto/live** (ex.: "Lives da Ju", "Aulão de Terça"). Substitui "BIM Coder Lives" e "Live BIM Coder".
2. **Assinatura do rodapé** (nome/arroba/e-mail dela).
3. **As recompensas**: quantos marcos, em quais números de presenças seguidas, e qual o prêmio de cada um. Se ela não souber, sugira manter o padrão validado: 4 marcos em 5, 10, 15 e 25 lives (do brinde leve ao desconto forte — o mais valioso sempre por último). Os links de entrega podem ficar pendentes por enquanto.

Com as respostas, edite:

| O quê | Onde |
|---|---|
| Títulos, subtítulo e rodapé | `src/pages/StudentPage.tsx` e `index.html` (`<title>`) |
| Lista de recompensas do front (marco, título, descrição, link, ícone) | `src/lib/rewards.ts` (array `REWARDS`) |
| Tipos das recompensas | `src/types/index.ts` (union `TipoRecompensa`) — mantenha os `tipo` idênticos aos usados em `rewards.ts` e no SQL |
| Lógica de desbloqueio no banco | gere `supabase/migrations/setup_personalizado.sql` (ver abaixo) |

**Gerando `setup_personalizado.sql`:** copie `supabase/migrations/001_initial_schema.sql` e ajuste:
1. No seed de `app_bimcoderlives_admin_emails`, troque o placeholder pelo **e-mail da pessoa** (será o login do painel admin — pergunte qual ela quer usar).
2. Na função `app_bimcoderlives_registrar_presenca`, reescreva os blocos `IF v_novo_streak >= N THEN ...` para refletir exatamente os marcos, `tipo` e `titulo` definidos em `rewards.ts`.

> ⚠️ **Invariante crítico:** os marcos e `tipo`s existem em DOIS lugares — `src/lib/rewards.ts` (exibição) e a RPC no SQL (desbloqueio real). Eles DEVEM ficar idênticos. Se a pessoa mudar as recompensas no futuro, os dois lados mudam juntos (no banco: rodar de novo só o `CREATE OR REPLACE FUNCTION`).

Não é preciso renomear as tabelas `app_bimcoderlives_*` — o prefixo é interno e invisível para a audiência.

## ETAPA 2 — Conta no GitHub e repositório próprio

1. Se não tem conta: a pessoa cria em https://github.com/signup (e-mail, senha, nome de usuário). Ela faz sozinha; você só orienta.
2. Crie o repositório dela:
   - **Se veio de "Use this template" / clone:** o repo dela talvez já exista; confirme com `git remote -v`.
   - **Se veio de ZIP (sem `.git`):** rode `git init`, `git add -A`, primeiro commit; depois orient-a a criar um repositório vazio em https://github.com/new (nome sugerido: `sistema-recompensas-lives`, **privado pode**, Vercel acessa mesmo assim); então `git remote add origin <url>` e `git push -u origin main`.
3. No primeiro `git push`, o **Git Credential Manager** abre uma janela de login do GitHub no navegador — a pessoa entra lá (nunca digite a senha dela no terminal).

Commite e pushe as personalizações da Etapa 1.

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
3. Roteiro de teste com a pessoa:
   - Abrir `/admin` → logar com o e-mail/senha criados na Etapa 3.4.
   - Configurar a **Live #1**: número 1, um título, uma senha de teste (ex.: `teste123`), status **aberto**.
   - Voltar à página inicial → preencher o formulário como se fosse um aluno (pode usar um e-mail fictício tipo `teste@teste.com`) → deve aparecer a tela de sucesso com streak = 1.
   - Conferir no `/admin` que o ranking mostra o registro.
4. Limpe o teste no SQL Editor:

```sql
DELETE FROM app_bimcoderlives_presencas WHERE email = 'teste@teste.com';
DELETE FROM app_bimcoderlives_ranking_usuarios WHERE email = 'teste@teste.com';
```

## ETAPA 5 — Publicar na Vercel

1. Conta: https://vercel.com/signup → **Continue with GitHub** (assim a Vercel já enxerga o repositório).
2. **Add New… → Project** → Import no repositório criado na Etapa 2. Framework: a Vercel detecta **Vite** sozinha; não mexa em build settings.
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
| Site abre com aviso de configuração / formulário não envia | `.env` ausente ou URL/key erradas | Conferir `.env` (local) ou Environment Variables + Redeploy (Vercel) |
| "Nenhuma live configurada" | Nunca criou live no `/admin` | Etapa 4.3 |
| "Formulário fechado" | `status_aberto` desligado | Abrir no `/admin` |
| "Senha incorreta" no login admin | Usuário não existe ou e-mail fora da whitelist | Conferir Authentication → Users e a tabela `app_bimcoderlives_admin_emails` |
| Login admin ok, mas sem permissão de salvar | E-mail logado ≠ e-mail da whitelist (maiúsculas contam: whitelist guarda minúsculo) | `INSERT INTO app_bimcoderlives_admin_emails (email) VALUES ('email@dominio.com');` |
| Mudou o `.env` e nada aconteceu | Vite não relê env em quente | Parar e rodar `npm run dev` de novo |
| Streak não somou | `id_live` não é o anterior + 1 | Corrigir a numeração no `/admin` |
| Recompensa aparece no site mas não desbloqueia (ou vice-versa) | `rewards.ts` e RPC dessincronizados | Ver invariante da Etapa 1; recriar a função no SQL Editor |

## Checklist final (confirme item a item com a pessoa)

- [ ] Site personalizado com nome/marca dela
- [ ] Recompensas e marcos dela (front + SQL idênticos)
- [ ] Repositório próprio no GitHub com push funcionando
- [ ] Migration rodada no Supabase + usuário admin criado
- [ ] Teste completo local **e** em produção (e dados de teste apagados)
- [ ] Ela sabe operar a rotina da live (número sequencial, senha do dia, abrir/fechar)
- [ ] Links das recompensas preenchidos (ou anotados como pendência)
