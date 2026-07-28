export type LiveStatus = 'aberto' | 'fechado';

export interface ConfigLive {
  id: string;
  id_live: number;
  titulo_live: string | null;
  senha_ativa: string;
  status_aberto: boolean;
  data_live: string;
  created_at: string;
  updated_at: string;
}

export interface LiveAtual {
  id: string;
  id_live: number;
  titulo_live: string | null;
  status_aberto: boolean;
  data_live: string;
  created_at: string;
}

export interface RankingUsuario {
  id: string;
  email: string;
  nome: string;
  streak: number;
  maior_streak: number;
  total_lives: number;
  ultimo_id_assistido: number | null;
  ultima_presenca: string;
  recompensas_desbloqueadas: Recompensa[];
  created_at: string;
  updated_at: string;
}

export type TipoRecompensa = 'prompt_pyrevit' | 'ebook' | 'plantao' | 'cupom';

export interface Recompensa {
  tipo: TipoRecompensa;
  titulo: string;
  desbloqueado_em: number;
}

export interface RegistrarPresencaPayload {
  p_nome: string;
  p_email: string;
  p_senha: string;
  p_insight: string;
}

export type RegistrarPresencaResponse =
  | {
      success: true;
      nome: string;
      email: string;
      streak: number;
      maior_streak: number;
      total_lives: number;
      id_live_atual: number;
      titulo_live: string | null;
      recompensas: Recompensa[];
    }
  | {
      success: false;
      error: string;
      streak?: number;
    };
