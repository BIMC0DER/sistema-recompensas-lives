-- =====================================================================
-- BIM Coder Lives — Gamificação de Frequência
-- Schema com prefixo `app_bimcoderlives_` para namespace isolado.
-- Auth: Supabase Auth (email/senha) + whitelist de admins via tabela.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) TABELA: app_bimcoderlives_config_live
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_bimcoderlives_config_live (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_live         INTEGER NOT NULL,
  titulo_live     TEXT,
  senha_ativa     TEXT NOT NULL,
  status_aberto   BOOLEAN NOT NULL DEFAULT FALSE,
  data_live       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_bimcoderlives_config_live_created_at
  ON public.app_bimcoderlives_config_live (created_at DESC);

-- ---------------------------------------------------------------------
-- 2) TABELA: app_bimcoderlives_ranking_usuarios
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_bimcoderlives_ranking_usuarios (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                      TEXT UNIQUE NOT NULL,
  nome                       TEXT NOT NULL,
  streak                     INTEGER NOT NULL DEFAULT 1,
  maior_streak               INTEGER NOT NULL DEFAULT 1,
  total_lives                INTEGER NOT NULL DEFAULT 1,
  ultimo_id_assistido        INTEGER,
  ultima_presenca            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recompensas_desbloqueadas  JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_bimcoderlives_ranking_streak
  ON public.app_bimcoderlives_ranking_usuarios (streak DESC);

-- ---------------------------------------------------------------------
-- 3) TABELA: app_bimcoderlives_presencas
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_bimcoderlives_presencas (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email              TEXT NOT NULL,
  nome               TEXT NOT NULL,
  id_live            INTEGER NOT NULL,
  insight            TEXT,
  streak_no_momento  INTEGER NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT app_bimcoderlives_presencas_email_id_live_unique UNIQUE (email, id_live)
);

CREATE INDEX IF NOT EXISTS idx_app_bimcoderlives_presencas_email
  ON public.app_bimcoderlives_presencas (email);

CREATE INDEX IF NOT EXISTS idx_app_bimcoderlives_presencas_id_live
  ON public.app_bimcoderlives_presencas (id_live);

-- ---------------------------------------------------------------------
-- 4) TABELA: app_bimcoderlives_admin_emails
--    Whitelist de emails que podem operar o painel admin.
--    Comparação feita server-side via auth.email() (Supabase Auth).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_bimcoderlives_admin_emails (
  email       TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: emails admin — TROQUE pelo SEU e-mail antes de rodar!
-- (será o login do painel /admin; sempre em minúsculo)
INSERT INTO public.app_bimcoderlives_admin_emails (email)
VALUES ('seu-email@exemplo.com')
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------
-- 5) FUNÇÃO: is_admin()
--    Retorna TRUE se o usuário autenticado está na whitelist.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.app_bimcoderlives_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.app_bimcoderlives_admin_emails
    WHERE email = LOWER(auth.email())
  );
$$;

GRANT EXECUTE ON FUNCTION public.app_bimcoderlives_is_admin()
  TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 6) RPC: app_bimcoderlives_registrar_presenca (lógica do aluno)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.app_bimcoderlives_registrar_presenca(
  p_nome    TEXT,
  p_email   TEXT,
  p_senha   TEXT,
  p_insight TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config         public.app_bimcoderlives_config_live%ROWTYPE;
  v_usuario        public.app_bimcoderlives_ranking_usuarios%ROWTYPE;
  v_novo_streak    INTEGER;
  v_maior_streak   INTEGER;
  v_total_lives    INTEGER;
  v_recompensas    JSONB := '[]'::jsonb;
  v_email_norm     TEXT;
BEGIN
  v_email_norm := LOWER(TRIM(p_email));

  IF v_email_norm IS NULL OR v_email_norm = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'E-mail inválido');
  END IF;
  IF p_nome IS NULL OR TRIM(p_nome) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nome obrigatório');
  END IF;

  SELECT * INTO v_config
    FROM public.app_bimcoderlives_config_live
    ORDER BY created_at DESC
    LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nenhuma live configurada');
  END IF;

  IF NOT v_config.status_aberto THEN
    RETURN jsonb_build_object('success', false, 'error', 'Formulário fechado');
  END IF;

  IF v_config.senha_ativa <> p_senha THEN
    RETURN jsonb_build_object('success', false, 'error', 'Senha incorreta');
  END IF;

  SELECT * INTO v_usuario
    FROM public.app_bimcoderlives_ranking_usuarios
    WHERE email = v_email_norm;

  IF NOT FOUND THEN
    v_novo_streak  := 1;
    v_maior_streak := 1;
    v_total_lives  := 1;

    INSERT INTO public.app_bimcoderlives_ranking_usuarios (
      email, nome, streak, maior_streak, total_lives, ultimo_id_assistido
    ) VALUES (
      v_email_norm, TRIM(p_nome), 1, 1, 1, v_config.id_live
    );
  ELSE
    IF v_usuario.ultimo_id_assistido = v_config.id_live THEN
      RETURN jsonb_build_object(
        'success', false,
        'error',   'Você já registrou presença nesta live',
        'streak',  v_usuario.streak
      );
    END IF;

    IF v_usuario.ultimo_id_assistido = v_config.id_live - 1 THEN
      v_novo_streak := v_usuario.streak + 1;
    ELSE
      v_novo_streak := 1;
    END IF;

    v_maior_streak := GREATEST(v_usuario.maior_streak, v_novo_streak);
    v_total_lives  := v_usuario.total_lives + 1;

    UPDATE public.app_bimcoderlives_ranking_usuarios
       SET streak              = v_novo_streak,
           maior_streak        = v_maior_streak,
           total_lives         = v_total_lives,
           ultimo_id_assistido = v_config.id_live,
           ultima_presenca     = NOW(),
           nome                = TRIM(p_nome),
           updated_at          = NOW()
     WHERE email = v_email_norm;
  END IF;

  INSERT INTO public.app_bimcoderlives_presencas (email, nome, id_live, insight, streak_no_momento)
  VALUES (v_email_norm, TRIM(p_nome), v_config.id_live, p_insight, v_novo_streak);

  IF v_novo_streak >= 5 THEN
    v_recompensas := v_recompensas || jsonb_build_object(
      'tipo', 'prompt_pyrevit', 'titulo', 'Modelo de Prompt', 'desbloqueado_em', 5
    );
  END IF;
  IF v_novo_streak >= 10 THEN
    v_recompensas := v_recompensas || jsonb_build_object(
      'tipo', 'ebook', 'titulo', 'Mini E-book Fundamentos', 'desbloqueado_em', 10
    );
  END IF;
  IF v_novo_streak >= 15 THEN
    v_recompensas := v_recompensas || jsonb_build_object(
      'tipo', 'plantao', 'titulo', 'Convite Plantão Tira-Dúvidas', 'desbloqueado_em', 15
    );
  END IF;
  IF v_novo_streak >= 25 THEN
    v_recompensas := v_recompensas || jsonb_build_object(
      'tipo', 'cupom', 'titulo', 'Cupom de 40% de Desconto', 'desbloqueado_em', 25
    );
  END IF;

  UPDATE public.app_bimcoderlives_ranking_usuarios
     SET recompensas_desbloqueadas = v_recompensas
   WHERE email = v_email_norm;

  RETURN jsonb_build_object(
    'success',          true,
    'nome',             TRIM(p_nome),
    'email',            v_email_norm,
    'streak',           v_novo_streak,
    'maior_streak',     v_maior_streak,
    'total_lives',      v_total_lives,
    'id_live_atual',    v_config.id_live,
    'titulo_live',      v_config.titulo_live,
    'recompensas',      v_recompensas
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.app_bimcoderlives_registrar_presenca(TEXT, TEXT, TEXT, TEXT)
  TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 7) RLS — Row Level Security
--    Aluno (anon): só lê. Admin (auth + whitelist): lê + escreve.
-- ---------------------------------------------------------------------
ALTER TABLE public.app_bimcoderlives_config_live      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_bimcoderlives_ranking_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_bimcoderlives_presencas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_bimcoderlives_admin_emails     ENABLE ROW LEVEL SECURITY;

-- config_live: SELECT público, INSERT/UPDATE/DELETE só admin
DROP POLICY IF EXISTS "select_app_bimcoderlives_config_live_anon"
  ON public.app_bimcoderlives_config_live;
CREATE POLICY "select_app_bimcoderlives_config_live_anon"
  ON public.app_bimcoderlives_config_live FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "admin_insert_app_bimcoderlives_config_live"
  ON public.app_bimcoderlives_config_live;
CREATE POLICY "admin_insert_app_bimcoderlives_config_live"
  ON public.app_bimcoderlives_config_live FOR INSERT
  TO authenticated
  WITH CHECK (public.app_bimcoderlives_is_admin());

DROP POLICY IF EXISTS "admin_update_app_bimcoderlives_config_live"
  ON public.app_bimcoderlives_config_live;
CREATE POLICY "admin_update_app_bimcoderlives_config_live"
  ON public.app_bimcoderlives_config_live FOR UPDATE
  TO authenticated
  USING (public.app_bimcoderlives_is_admin())
  WITH CHECK (public.app_bimcoderlives_is_admin());

DROP POLICY IF EXISTS "admin_delete_app_bimcoderlives_config_live"
  ON public.app_bimcoderlives_config_live;
CREATE POLICY "admin_delete_app_bimcoderlives_config_live"
  ON public.app_bimcoderlives_config_live FOR DELETE
  TO authenticated
  USING (public.app_bimcoderlives_is_admin());

-- ranking_usuarios: SELECT público (ranking visível). UPDATE/DELETE só admin (cleanup).
DROP POLICY IF EXISTS "select_app_bimcoderlives_ranking_anon"
  ON public.app_bimcoderlives_ranking_usuarios;
CREATE POLICY "select_app_bimcoderlives_ranking_anon"
  ON public.app_bimcoderlives_ranking_usuarios FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "admin_modify_app_bimcoderlives_ranking"
  ON public.app_bimcoderlives_ranking_usuarios;
CREATE POLICY "admin_modify_app_bimcoderlives_ranking"
  ON public.app_bimcoderlives_ranking_usuarios FOR ALL
  TO authenticated
  USING (public.app_bimcoderlives_is_admin())
  WITH CHECK (public.app_bimcoderlives_is_admin());

-- presencas: leitura só admin (histórico contém insights). INSERT via RPC SECURITY DEFINER.
DROP POLICY IF EXISTS "admin_select_app_bimcoderlives_presencas"
  ON public.app_bimcoderlives_presencas;
CREATE POLICY "admin_select_app_bimcoderlives_presencas"
  ON public.app_bimcoderlives_presencas FOR SELECT
  TO authenticated
  USING (public.app_bimcoderlives_is_admin());

-- admin_emails: leitura só admin (não vazar lista pra anon).
DROP POLICY IF EXISTS "admin_select_app_bimcoderlives_admin_emails"
  ON public.app_bimcoderlives_admin_emails;
CREATE POLICY "admin_select_app_bimcoderlives_admin_emails"
  ON public.app_bimcoderlives_admin_emails FOR SELECT
  TO authenticated
  USING (public.app_bimcoderlives_is_admin());

-- ---------------------------------------------------------------------
-- 8) VIEW pública para o status atual da live (sem expor senha)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW public.app_bimcoderlives_live_atual AS
SELECT id, id_live, titulo_live, status_aberto, data_live, created_at
  FROM public.app_bimcoderlives_config_live
  ORDER BY created_at DESC
  LIMIT 1;

GRANT SELECT ON public.app_bimcoderlives_live_atual TO anon, authenticated;
