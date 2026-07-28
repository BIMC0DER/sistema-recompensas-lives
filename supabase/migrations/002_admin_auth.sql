-- =====================================================================
-- Migration 002: Auth admin via whitelist de email
-- Rode este script no SQL Editor (Supabase) — incremental ao 001.
-- =====================================================================

-- 1) Tabela de admins
CREATE TABLE IF NOT EXISTS public.app_bimcoderlives_admin_emails (
  email       TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TROQUE pelo SEU e-mail antes de rodar (login do painel /admin, em minúsculo)
INSERT INTO public.app_bimcoderlives_admin_emails (email)
VALUES ('seu-email@exemplo.com')
ON CONFLICT (email) DO NOTHING;

-- 2) Função is_admin()
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

GRANT EXECUTE ON FUNCTION public.app_bimcoderlives_is_admin() TO anon, authenticated;

-- 3) RLS na tabela admin_emails
ALTER TABLE public.app_bimcoderlives_admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_app_bimcoderlives_admin_emails"
  ON public.app_bimcoderlives_admin_emails;
CREATE POLICY "admin_select_app_bimcoderlives_admin_emails"
  ON public.app_bimcoderlives_admin_emails FOR SELECT
  TO authenticated
  USING (public.app_bimcoderlives_is_admin());

-- 4) Policies admin em config_live (INSERT/UPDATE/DELETE)
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

-- 5) Policies admin em ranking_usuarios (cleanup)
DROP POLICY IF EXISTS "admin_modify_app_bimcoderlives_ranking"
  ON public.app_bimcoderlives_ranking_usuarios;
CREATE POLICY "admin_modify_app_bimcoderlives_ranking"
  ON public.app_bimcoderlives_ranking_usuarios FOR ALL
  TO authenticated
  USING (public.app_bimcoderlives_is_admin())
  WITH CHECK (public.app_bimcoderlives_is_admin());

-- 6) Policy admin em presencas (ler histórico/insights)
DROP POLICY IF EXISTS "admin_select_app_bimcoderlives_presencas"
  ON public.app_bimcoderlives_presencas;
CREATE POLICY "admin_select_app_bimcoderlives_presencas"
  ON public.app_bimcoderlives_presencas FOR SELECT
  TO authenticated
  USING (public.app_bimcoderlives_is_admin());
