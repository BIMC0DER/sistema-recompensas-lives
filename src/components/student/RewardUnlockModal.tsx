import { useEffect } from 'react';
import { X, Sparkles, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { RewardDefinition } from '@/lib/rewards';

interface RewardUnlockModalProps {
  reward: RewardDefinition;
  open: boolean;
  onClose: () => void;
}

export function RewardUnlockModal({ reward, open, onClose }: RewardUnlockModalProps) {
  // Confetti em cascata enquanto o modal está aberto
  useEffect(() => {
    if (!open) return;
    const end = Date.now() + 1500;
    const colors = ['#7F56D9', '#9E77ED', '#F79009', '#12B76A'];
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [open]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const Icon = reward.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-md animate-bounce-soft overflow-hidden rounded-2xl bg-white shadow-untitled-xl dark:bg-gray-900">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header com gradient */}
        <div
          className={cn(
            'relative bg-gradient-to-br px-6 pb-8 pt-10 text-center text-white',
            reward.gradient
          )}
        >
          <div className="mx-auto mb-4 flex h-20 w-20 animate-pulse-soft items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Icon className="h-10 w-10" />
          </div>
          <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
            <Sparkles className="h-3 w-3" />
            Recompensa desbloqueada
          </p>
          <h2 id="reward-modal-title" className="mt-3 text-2xl font-bold sm:text-3xl">
            {reward.titulo}
          </h2>
          <p className="mt-2 text-sm text-white/90">
            {reward.marco} lives consecutivas
          </p>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-6 text-center">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {reward.descricao}
          </p>

          <Button
            size="lg"
            fullWidth
            icon={<ExternalLink className="h-4 w-4" />}
            iconPosition="right"
            onClick={() => window.open(reward.link, '_blank', 'noopener,noreferrer')}
          >
            Resgatar agora
          </Button>

          <button
            onClick={onClose}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Resgatar depois
          </button>
        </div>
      </div>
    </div>
  );
}
