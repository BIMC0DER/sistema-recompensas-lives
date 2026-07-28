import { Lock, CheckCircle2 } from 'lucide-react';
import { REWARDS } from '@/lib/rewards';
import { cn } from '@/lib/utils';

interface EvolutionTrackProps {
  streak: number;
  className?: string;
  /** Modo "preview" antes de registrar — esconde contador X/N. */
  preview?: boolean;
}

export function EvolutionTrack({ streak, className, preview }: EvolutionTrackProps) {
  const max = REWARDS[REWARDS.length - 1].marco;
  const pct = Math.min(100, Math.round((streak / max) * 100));
  const titulo = preview ? 'Prêmios por sequência' : 'Trilha de evolução';

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-4 flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {titulo}
        </h4>
        {!preview && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {streak}/{max} lives
          </span>
        )}
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {REWARDS.map((r) => {
          const desbloqueado = streak >= r.marco;
          const Icon = r.icon;
          return (
            <div
              key={r.tipo}
              className={cn(
                'flex flex-col items-center text-center transition-opacity',
                !desbloqueado && 'opacity-70'
              )}
            >
              <div
                className={cn(
                  'mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2',
                  desbloqueado
                    ? 'border-brand-500 bg-brand-50 text-brand-600 dark:border-brand-500 dark:bg-brand-950 dark:text-brand-300'
                    : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                )}
              >
                {desbloqueado ? (
                  <Icon className="h-5 w-5" />
                ) : preview ? (
                  <Icon className="h-5 w-5" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </div>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {r.marco}
              </span>
              <span className="mt-0.5 text-[10px] leading-tight text-gray-500 dark:text-gray-400">
                {r.titulo.split(':')[0]}
              </span>
              {desbloqueado && (
                <CheckCircle2 className="mt-1 h-3 w-3 text-success-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
