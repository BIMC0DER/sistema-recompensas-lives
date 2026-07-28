-- =====================================================================
-- Migration 003: rename "Modelo de Prompt pyRevit" → "Modelo de Prompt"
-- na RPC registrar_presenca + nos registros existentes em recompensas_desbloqueadas.
-- =====================================================================

-- 1) Recriar a RPC com o novo título
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
    ORDER BY created_at DESC LIMIT 1;

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

-- 2) Atualizar registros existentes em ranking_usuarios.recompensas_desbloqueadas
UPDATE public.app_bimcoderlives_ranking_usuarios
   SET recompensas_desbloqueadas = REPLACE(
     recompensas_desbloqueadas::TEXT,
     '"Modelo de Prompt pyRevit"',
     '"Modelo de Prompt"'
   )::jsonb
 WHERE recompensas_desbloqueadas::TEXT LIKE '%Modelo de Prompt pyRevit%';
