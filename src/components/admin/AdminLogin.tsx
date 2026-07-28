import { useState } from 'react';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (signErr) {
      setError(signErr.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos'
        : signErr.message);
      return;
    }
    // useAuth detecta a sessão e libera o painel automaticamente
  }

  return (
    <Card className="mx-auto max-w-md animate-slide-up">
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <CardTitle>Painel do Professor</CardTitle>
        <CardDescription>
          Acesso restrito. Faça login com sua conta admin.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            autoComplete="email"
            autoFocus
            disabled={loading}
          />
          <Input
            label="Senha"
            type="password"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            autoComplete="current-password"
            disabled={loading}
          />
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-700 dark:bg-error-500/10 dark:text-error-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button type="submit" fullWidth loading={loading}>
            Entrar
          </Button>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Sua conta precisa estar na whitelist de admins.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
