import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Trophy, ExternalLink, Sparkles, RefreshCcw, Gift } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EvolutionTrack } from './EvolutionTrack';
import { RewardUnlockModal } from './RewardUnlockModal';
import {
  REWARDS,
  proximoMarco,
  livesParaProximoMarco,
  recompensasConquistadas,
} from '@/lib/rewards';
import type { RegistrarPresencaResponse } from '@/types';

interface SuccessScreenProps {
  data: Extract<RegistrarPresencaResponse, { success: true }>;
  onReset: () => void;
}

export function SuccessScreen({ data, onReset }: SuccessScreenProps) {
  const conquistadas = recompensasConquistadas(data.streak);
  const prox = proximoMarco(data.streak);
  const faltam = livesParaProximoMarco(data.streak);

  // Detecta prêmio recém-desbloqueado: streak atual bate exatamente com algum marco
  const recemDesbloqueada = REWARDS.find((r) => r.marco === data.streak) ?? null;

  const [modalOpen, setModalOpen] = useState<boolean>(Boolean(recemDesbloqueada));

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#7F56D9', '#9E77ED', '#D6BBFB', '#12B76A'],
    });
  }, [data.streak]);

  return (
    <>
      <div className="mx-auto w-full max-w-2xl space-y-6 animate-fade-in">
        {/* Banner persistente — só aparece se desbloqueou prêmio E modal está fechado */}
        {recemDesbloqueada && !modalOpen && (
          <button
            onClick={() => setModalOpen(true)}
            className={`group flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r ${recemDesbloqueada.gradient} p-5 text-left text-white shadow-untitled-lg transition-transform hover:scale-[1.01] active:scale-100 animate-bounce-soft`}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Gift className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                Prêmio liberado
              </p>
              <p className="mt-0.5 truncate text-lg font-bold">
                {recemDesbloqueada.titulo}
              </p>
              <p className="mt-0.5 text-sm text-white/90">
                Toque para resgatar
              </p>
            </div>
            <ExternalLink className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-6 py-10 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 animate-bounce-soft items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Presença confirmada, {data.nome.split(' ')[0]}! 🎉
            </h2>
            <p className="mt-1 text-brand-100">
              {data.titulo_live ?? `Live #${data.id_live_atual}`}
            </p>

            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-amber-300">
                  <Flame className="h-7 w-7" />
                  <span className="text-4xl font-extrabold tabular-nums">
                    {data.streak}
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-brand-100">
                  sequência atual
                </p>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-200" />
                  <span className="text-3xl font-extrabold tabular-nums">
                    {data.maior_streak}
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-brand-100">
                  recorde
                </p>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-extrabold tabular-nums">
                  {data.total_lives}
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-brand-100">
                  total
                </p>
              </div>
            </div>
          </div>

          <CardBody className="space-y-6">
            {prox && faltam !== null ? (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/40">
                <div className="flex items-start gap-3">
                  <prox.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-900 dark:text-brand-200">
                      Faltam {faltam} {faltam === 1 ? 'live' : 'lives'} para
                      desbloquear
                    </p>
                    <p className="mt-0.5 text-sm text-brand-700 dark:text-brand-300">
                      <strong>{prox.titulo}</strong> — {prox.descricao}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Você desbloqueou todas as recompensas! Lenda viva. 🏆
                  </p>
                </div>
              </div>
            )}

            <EvolutionTrack streak={data.streak} />

            {conquistadas.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Suas recompensas
                </h4>
                <div className="space-y-2">
                  {conquistadas.map((r) => {
                    const Icon = r.icon;
                    return (
                      <a
                        key={r.tipo}
                        href={r.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-untitled-xs transition-all hover:border-brand-400 hover:shadow-untitled-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-600"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${r.gradient} text-white shadow-untitled-sm`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {r.titulo}
                            </p>
                            <Badge tone="success">{r.marco}+</Badge>
                          </div>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {r.descricao}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 transition-colors group-hover:text-brand-600" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {conquistadas.length === 0 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Mantenha a constância — suas recompensas começam na{' '}
                <strong>{REWARDS[0].marco}ª live</strong> consecutiva.
              </p>
            )}

            <Button
              variant="secondary"
              fullWidth
              icon={<RefreshCcw className="h-4 w-4" />}
              onClick={onReset}
            >
              Registrar outro aluno
            </Button>
          </CardBody>
        </Card>
      </div>

      {recemDesbloqueada && (
        <RewardUnlockModal
          reward={recemDesbloqueada}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
