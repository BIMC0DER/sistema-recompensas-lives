# Sistema de Recompensas para Lives 🎁

Transforme presença em live em um jogo: seus alunos/seguidores registram presença a cada live com a senha do dia, acumulam **sequência (streak)** e desbloqueiam **recompensas automáticas** nos marcos que você definir.

Exemplo real no ar: **https://bimcoderlives.vercel.app** — o sistema usado nas lives do [BIM Coder](https://youtube.com/@bimcoder), apresentado no Fluxo Festival.

| Para a audiência (`/`) | Para você (`/admin`) |
|---|---|
| Formulário de presença (nome, e-mail, senha da live, maior insight da aula) | Configura cada live: número, título, senha do dia, abrir/fechar |
| Trilha de evolução com os próximos prêmios | Ranking completo com streaks e recompensas desbloqueadas |
| Confete + aviso quando desbloqueia recompensa 🎉 | Insights coletados viram feedback das aulas |

Custo de operação: **R$ 0** (planos gratuitos de GitHub, Supabase e Vercel).

---

## 🚀 Comece aqui (não precisa saber programar)

Este projeto vem com um **guia interativo dentro do Claude Code** que faz todo o processo com você, passo a passo: criar as contas, configurar o banco, personalizar as recompensas com a sua marca e publicar o site.

1. **Instale o Claude Code** → https://claude.com/claude-code (app para Windows/Mac ou extensão do VS Code).
2. **Baixe este projeto**: botão verde **Code → Download ZIP** aqui no GitHub (ou **Use this template**, se você já tem conta). Descompacte em uma pasta.
3. **Abra a pasta no Claude Code.**
4. Digite:

```
/implementar-sistema-de-recompensas
```

O guia assume que você é iniciante: explica cada ferramenta, dita onde clicar e faz a parte técnica por você. Reserve de 1 a 2 horas.

---

## Como funciona a gamificação

- Cada live tem um **número sequencial** (1, 2, 3, ...) e uma **senha do dia**, falada só ao vivo — é isso que premia quem está presente de verdade.
- Presença na live seguinte → streak +1. Pulou uma live → streak volta a 1 (o recorde fica salvo em `maior_streak`). Registrar duas vezes na mesma live → bloqueado.
- Nos marcos configurados, a recompensa desbloqueia na hora, com direito a confete na tela.

Marcos padrão (personalizáveis no guia):

| Streak | Recompensa (exemplo BIM Coder) |
|--------|-------------------------------|
| 5      | Modelo de Prompt |
| 10     | Mini E-book Fundamentos |
| 15     | Convite Plantão Tira-Dúvidas |
| 25     | Cupom de 40% OFF |

> ⚠️ Os marcos vivem em **dois lugares que precisam ficar idênticos**: `src/lib/rewards.ts` (exibição no site) e a RPC `app_bimcoderlives_registrar_presenca` (desbloqueio real, no SQL). O guia interativo cuida disso por você.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind (tokens Untitled UI) + lucide-react + canvas-confetti
- **Backend:** Supabase (PostgreSQL) — a RPC `app_bimcoderlives_registrar_presenca` valida senha, calcula streak e desbloqueia recompensas 100% server-side
- **Auth do admin:** Supabase Auth (e-mail/senha) + whitelist na tabela `app_bimcoderlives_admin_emails` (RLS em todas as tabelas)
- **Deploy:** Vercel (SPA com rewrite em `vercel.json`)

## Setup manual (para quem é dev)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Banco: cole supabase/migrations/001_initial_schema.sql no SQL Editor do Supabase
#    (troque o e-mail do seed de app_bimcoderlives_admin_emails pelo seu)
#    e crie o usuário admin em Authentication > Users (Auto Confirm).

# 4. Rodar
npm run dev
```

Rotas: `/` formulário público · `/admin` painel do professor.

Deploy: importe o repo na Vercel com as duas env vars acima. Todo push na `main` republica.

## Estrutura

```
src/
├── components/
│   ├── ui/            Button, Input, Card, Badge, Textarea, ThemeToggle
│   ├── student/       StudentForm, SuccessScreen, EvolutionTrack, RewardUnlockModal
│   └── admin/         AdminLogin, LiveConfigForm, RankingTable
├── pages/             StudentPage, AdminPage
├── lib/               supabase, rewards, utils
├── hooks/             useAuth, useTheme
└── types/             tipos compartilhados

supabase/migrations/
├── 001_initial_schema.sql   schema completo: tabelas + RPC + RLS + view (instalação nova roda só este)
├── 002_admin_auth.sql       incremental p/ bancos antigos (já incluso no 001)
└── 003_rename_reward.sql    incremental p/ bancos antigos (já incluso no 001)

.claude/skills/
└── implementar-sistema-de-recompensas/   o guia interativo passo a passo
```

## Personalização rápida (dev)

| O quê | Onde |
|---|---|
| Nome do projeto, subtítulo, rodapé | `src/pages/StudentPage.tsx`, `index.html` |
| Recompensas exibidas (marcos, títulos, links, ícones) | `src/lib/rewards.ts` |
| Tipos das recompensas | `src/types/index.ts` (`TipoRecompensa`) |
| Desbloqueio real no banco | blocos `IF v_novo_streak >= N` da RPC (SQL) |
| E-mails com acesso ao `/admin` | tabela `app_bimcoderlives_admin_emails` |
