import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudentPage } from '@/pages/StudentPage';
import { AdminPage } from '@/pages/AdminPage';
import { supabase } from '@/lib/supabase';

/**
 * Consome tokens de sessão passados via URL hash (handoff de outros apps
 * BIM Coder no mesmo Supabase). Formato esperado:
 *   #access_token=...&refresh_token=...
 * Após setar a sessão, limpa o hash da URL para não vazar no histórico.
 */
function useExternalSessionHandoff(): boolean {
  const [ready, setReady] = useState(() => {
    const hash = window.location.hash;
    // Não toca em recovery (reset de senha) — Supabase trata sozinho.
    if (hash.includes('type=recovery')) return true;
    return !(hash.includes('access_token=') && hash.includes('refresh_token='));
  });

  useEffect(() => {
    if (ready) return;
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (!access_token || !refresh_token) {
      setReady(true);
      return;
    }
    let cancelled = false;
    supabase.auth
      .setSession({ access_token, refresh_token })
      .catch(() => {
        // ignora — usuário cai no fluxo de login normal
      })
      .finally(() => {
        if (cancelled) return;
        // limpa o hash da URL
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  return ready;
}

export default function App() {
  const ready = useExternalSessionHandoff();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-sm text-gray-500">Conectando...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
