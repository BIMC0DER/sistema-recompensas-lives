import { useEffect, useState } from 'react';
import {
  Save,
  PlayCircle,
  StopCircle,
  Hash,
  KeyRound,
  Type,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ConfigLive } from '@/types';

interface FormState {
  id_live: string;
  titulo_live: string;
  senha_ativa: string;
}

const INITIAL: FormState = { id_live: '', titulo_live: '', senha_ativa: '' };

export function LiveConfigForm() {
  const [current, setCurrent] = useState<ConfigLive | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: 'ok' | 'err';
    msg: string;
  } | null>(null);

  async function loadCurrent() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('app_bimcoderlives_config_live')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      const c = data as ConfigLive;
      setCurrent(c);
      setForm({
        id_live: String(c.id_live),
        titulo_live: c.titulo_live ?? '',
        senha_ativa: c.senha_ativa,
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCurrent();
  }, []);

  async function salvarNovaLive(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const idNum = parseInt(form.id_live, 10);
    if (!idNum || idNum < 1) {
      setFeedback({ kind: 'err', msg: 'ID da live deve ser um número ≥ 1' });
      return;
    }
    if (!form.senha_ativa.trim()) {
      setFeedback({ kind: 'err', msg: 'Defina a senha ativa' });
      return;
    }

    setSaving(true);
    // Insere uma NOVA linha — a "live atual" é sempre a mais recente.
    const { error } = await supabase.from('app_bimcoderlives_config_live').insert({
      id_live: idNum,
      titulo_live: form.titulo_live.trim() || null,
      senha_ativa: form.senha_ativa.trim(),
      status_aberto: false,
    });
    setSaving(false);

    if (error) {
      setFeedback({ kind: 'err', msg: error.message });
      return;
    }
    setFeedback({ kind: 'ok', msg: 'Nova live configurada (fechada). Abra quando quiser.' });
    await loadCurrent();
  }

  async function alternarStatus() {
    if (!current) return;
    setToggling(true);
    const { error } = await supabase
      .from('app_bimcoderlives_config_live')
      .update({ status_aberto: !current.status_aberto, updated_at: new Date().toISOString() })
      .eq('id', current.id);
    setToggling(false);
    if (error) {
      setFeedback({ kind: 'err', msg: error.message });
      return;
    }
    setFeedback({
      kind: 'ok',
      msg: !current.status_aberto ? 'Formulário ABERTO ✅' : 'Formulário FECHADO',
    });
    await loadCurrent();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Configuração da live</CardTitle>
            <CardDescription>
              Defina o ID, senha e status do formulário do dia.
            </CardDescription>
          </div>
          {current && (
            <Badge tone={current.status_aberto ? 'success' : 'gray'}>
              {current.status_aberto ? 'ABERTO' : 'FECHADO'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {loading ? (
          <div className="py-6 text-center text-sm text-gray-500">Carregando...</div>
        ) : (
          <>
            {current && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Live ativa
                </p>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Live #{current.id_live}
                  </span>
                  {current.titulo_live && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {current.titulo_live}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Senha:{' '}
                  <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-700">
                    {current.senha_ativa}
                  </code>
                </p>
              </div>
            )}

            <form onSubmit={salvarNovaLive} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="ID da live"
                  type="number"
                  min={1}
                  placeholder="12"
                  icon={<Hash className="h-4 w-4" />}
                  value={form.id_live}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, id_live: e.target.value }))
                  }
                  disabled={saving}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Título (opcional)"
                    placeholder="Ex.: Automação de cotas"
                    icon={<Type className="h-4 w-4" />}
                    value={form.titulo_live}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, titulo_live: e.target.value }))
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <Input
                label="Senha ativa"
                placeholder="Senha que você vai dar na aula"
                icon={<KeyRound className="h-4 w-4" />}
                value={form.senha_ativa}
                onChange={(e) =>
                  setForm((f) => ({ ...f, senha_ativa: e.target.value }))
                }
                hint="Os alunos vão digitar essa senha no formulário."
                disabled={saving}
              />

              {feedback && (
                <div
                  className={
                    feedback.kind === 'ok'
                      ? 'flex items-start gap-2 rounded-lg border border-success-500/30 bg-success-50 p-3 text-sm text-success-700 dark:bg-success-500/10'
                      : 'flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-700 dark:bg-error-500/10 dark:text-error-400'
                  }
                >
                  {feedback.kind === 'ok' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{feedback.msg}</span>
                </div>
              )}

              <Button
                type="submit"
                loading={saving}
                icon={<Save className="h-4 w-4" />}
              >
                Salvar como nova live
              </Button>
            </form>
          </>
        )}
      </CardBody>

      {current && (
        <CardFooter className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Status atual:{' '}
            <strong>
              {current.status_aberto ? 'ABERTO para alunos' : 'FECHADO'}
            </strong>
          </p>
          <Button
            variant={current.status_aberto ? 'destructive' : 'success'}
            loading={toggling}
            icon={
              current.status_aberto ? (
                <StopCircle className="h-4 w-4" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )
            }
            onClick={alternarStatus}
          >
            {current.status_aberto ? 'Fechar formulário' : 'Abrir formulário'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
