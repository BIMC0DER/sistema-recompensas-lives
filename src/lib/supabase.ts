import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Aceita o URL com ou sem sufixo /rest/v1/ e remove barras finais
const url = rawUrl?.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
const anonKey = rawKey;

if (!url || !anonKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes. Configure o .env.'
  );
}

export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'bimcoder-lives-auth',
    },
  }
);

export const isSupabaseConfigured =
  Boolean(url) &&
  Boolean(anonKey) &&
  url !== 'https://placeholder.supabase.co' &&
  anonKey !== 'placeholder-anon-key';
