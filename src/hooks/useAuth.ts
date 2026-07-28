import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  checkingAdmin: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    setCheckingAdmin(true);
    supabase.rpc('app_bimcoderlives_is_admin').then(({ data, error }) => {
      if (cancelled) return;
      setIsAdmin(!error && data === true);
      setCheckingAdmin(false);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  return {
    session,
    user: session?.user ?? null,
    loading,
    isAdmin,
    checkingAdmin,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}
