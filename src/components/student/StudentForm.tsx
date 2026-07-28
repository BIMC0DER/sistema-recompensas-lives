import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  KeyRound,
  AlertCircle,
  Radio,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SuccessScreen } from './SuccessScreen';
import { EvolutionTrack } from './EvolutionTrack';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidEmail, formatEmail } from '@/lib/utils';
import type {
  LiveAtual,
  RegistrarPresencaResponse,
} from '@/types';

interface FormState {
  nome: string;
  email: string;
  senha: string;
  insight: string;
}

const INITIAL: FormState = { nome: '', email: '', senha: '', insight: '' };

export function StudentForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<
    Extract<RegistrarPresencaResponse, { success: true }> | null
  >(null);
  const [liveAtual, setLiveAtual] = useState<LiveAtual | null>(null);
  const [loadingLive, setLoadingLive] = useState(true);

  // Carregar status da live atual
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isSupabaseConfigured) {
        setLoadingLive(false);
        return;
      }
      const { data, error } = await supabase
        .from('app_bimcoderlives_live_atual')
        .select('*')
        .maybeSingle();
      if (cancelled) return;
      if (!error && data) setLiveAtual(data as LiveAtual);
      setLoadingLive(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setServerError(null);
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.nome.trim()) e.nome = 'Informe seu nome';
    if (!form.email.trim()) e.email = 'Informe seu e-mail';
    else if (!isValidEmail(form.email)) e.email = 'E-mail inválido';
    if (!form.senha.trim()) e.senha = 'Informe a senha da live';
    if (!form.insight.trim()) e.insight = 'Compartilhe seu maior insight';
    else if (form.insight.trim().length < 10)
      e.insight = 'Conte um pouco mais (mín. 10 caracteres)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setServerError(null);

    if (!isSupabaseConfigured) {
      setServerError(
        'Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ao .env.'
      );
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.rpc('app_bimcoderlives_registrar_presenca', {
      p_nome: form.nome.trim(),
      p_email: formatEmail(form.email),
      p_senha: form.senha.trim(),
      p_insight: form.insight.trim(),
    });
    setSubmitting(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    const resp = data as RegistrarPresencaResponse;
    if (!resp.success) {
      setServerError(resp.error);
      return;
    }

    setSuccess(resp);
    setForm(INITIAL);
  }

  if (success) {
    return <SuccessScreen data={success} onReset={() => setSuccess(null)} />;
  }

  const programaCard = (
    <Card className="animate-fade-in">
      <CardBody className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Programa de Recompensas
          </h3>
          <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-400">
            Presenças em sequência viram prêmio. Faltou a uma? A contagem reinicia do zero.
          </p>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          <p>
            Criamos um programa de recompensas para valorizar quem aparece toda
            semana. Não é sorteio, não é por acaso. É para quem estuda de
            verdade e está presente de forma contínua.
          </p>
          <p>
            <strong className="text-gray-900 dark:text-gray-100">
              Como funciona a sequência:
            </strong>{' '}
            durante cada live, eu vou divulgar uma senha exclusiva. Você anota,
            preenche o formulário que a gente disponibiliza durante a transmissão
            e a sua presença é computada.
          </p>
          <p>
            A sequência de lives assistidas, uma após a outra, sem pular nenhuma,
            é o que determina os prêmios que você desbloqueia.{' '}
            <strong className="text-gray-900 dark:text-gray-100">
              Ver a gravação depois não conta. Recuperar uma semana que você
              perdeu não é possível.
            </strong>{' '}
            Só vale para quem está ao vivo naquela sexta, com a senha na mão.
          </p>
        </div>
      </CardBody>
    </Card>
  );

  const trilhaCard = (
    <Card className="animate-fade-in">
      <CardBody>
        <EvolutionTrack streak={0} preview />
      </CardBody>
    </Card>
  );

  // Estado: Live fechada
  if (!loadingLive && liveAtual && !liveAtual.status_aberto) {
    return (
      <div className="mx-auto w-full max-w-xl space-y-6">
        {programaCard}
        {trilhaCard}
        <Card className="animate-fade-in">
          <CardBody className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Lock className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Formulário fechado
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              O formulário será reaberto durante a próxima live.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      {trilhaCard}

      <Card className="animate-slide-up">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Formulário</CardTitle>
              <CardDescription>
                Preencha durante a live com a senha de hoje.
              </CardDescription>
            </div>
            {liveAtual && (
              <Badge tone={liveAtual.status_aberto ? 'success' : 'gray'}>
                <Radio className="h-3 w-3" />
                Live #{liveAtual.id_live}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="Como você quer aparecer no ranking"
              icon={<User className="h-4 w-4" />}
              value={form.nome}
              onChange={(e) => update('nome', e.target.value)}
              error={errors.nome}
              autoComplete="name"
              disabled={submitting}
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail className="h-4 w-4" />}
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
              autoComplete="email"
              disabled={submitting}
            />

            <Input
              label="Senha da live de hoje"
              placeholder="Senha que apareceu na aula"
              icon={<KeyRound className="h-4 w-4" />}
              value={form.senha}
              onChange={(e) => update('senha', e.target.value)}
              error={errors.senha}
              autoComplete="off"
              disabled={submitting}
            />

            <Textarea
              label="Maior insight da aula"
              placeholder="O que você levou de mais valioso desta live?"
              rows={3}
              value={form.insight}
              onChange={(e) => update('insight', e.target.value)}
              error={errors.insight}
              hint="Esse campo me ajuda a melhorar as próximas aulas."
              disabled={submitting}
            />

            {serverError && (
              <div className="flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-700 dark:bg-error-500/10 dark:text-error-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={submitting}
              icon={!submitting ? <Sparkles className="h-4 w-4" /> : undefined}
            >
              {submitting ? 'Registrando...' : 'Confirmar presença'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {!isSupabaseConfigured && (
        <p className="mt-4 text-center text-xs text-amber-700 dark:text-amber-400">
          ⚠️ Supabase em modo placeholder — configure o <code>.env</code> antes do deploy.
        </p>
      )}
    </div>
  );
}
