# CLAUDE.md — Sistema de Recompensas para Lives

App web de gamificação de presença em lives: audiência registra presença com a senha do dia, acumula streak e desbloqueia recompensas em marcos. Template público do BIM Coder (demo: https://bimcoderlives.vercel.app).

**Usuário iniciante?** Se a pessoa quer "colocar o sistema no ar" e não é dev, use a skill `/implementar-sistema-de-recompensas` — guia completo de contas (GitHub/Supabase/Vercel), personalização e deploy.

## Stack

React 18 + Vite + TypeScript + Tailwind 3 (tokens Untitled UI) + Supabase (Postgres/Auth) + Vercel. Rotas: `/` (formulário do aluno) e `/admin` (painel do professor) — SPA com rewrite em `vercel.json`.

## Invariantes críticos

1. **Marcos de recompensa vivem em DOIS lugares e devem ser idênticos:** `src/lib/rewards.ts` (array `REWARDS`, só exibição) e os blocos `IF v_novo_streak >= N` da RPC `app_bimcoderlives_registrar_presenca` (desbloqueio real, SQL). Mudou um, mude o outro (no banco basta rodar de novo o `CREATE OR REPLACE FUNCTION`). Os valores de `tipo` também precisam bater com a union `TipoRecompensa` em `src/types/index.ts`.
2. **Toda a lógica de negócio é server-side** na RPC (SECURITY DEFINER): validação de senha, streak, idempotência, recompensas. O front nunca decide desbloqueio.
3. **`id_live` é sequencial e manual** (1, 2, 3, ...): streak só soma se `ultimo_id_assistido == id_live - 1`. Pular numeração zera streaks de todo mundo.
4. **Tabelas prefixadas `app_bimcoderlives_`** — namespace num projeto Supabase compartilhado com outros apps. Não renomear (o nome é invisível ao usuário final).
5. **Admin = Supabase Auth + whitelist** (tabela `app_bimcoderlives_admin_emails`, comparada via `auth.email()` em minúsculo). Não existe senha de admin em env var (o README antigo mencionava; foi removido).
6. **Env vars:** só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (`.env` local, gitignored; na Vercel, Environment Variables + Redeploy). Nunca commitar `.env`, nunca usar service_role no front.
7. **Migrations:** instalação nova roda só `001_initial_schema.sql` (já consolidada); `002` e `003` são incrementais para bancos que já existiam. O seed do admin em `001` usa placeholder — trocar pelo e-mail real antes de rodar.

## Handoff de sessão

`App.tsx` consome `#access_token=...&refresh_token=...` do hash na inicialização (SSO vindo de outros apps BIM Coder no mesmo Supabase) e limpa a URL. Não interfere com fluxo de recovery de senha (`type=recovery` é ignorado de propósito).
