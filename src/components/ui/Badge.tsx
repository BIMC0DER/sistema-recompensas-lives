import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'brand' | 'gray' | 'success' | 'warning' | 'error';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

const tones: Record<Tone, string> = {
  brand:
    'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-800',
  gray:
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  success:
    'bg-success-50 text-success-700 border-success-500/20 dark:bg-success-500/10 dark:text-success-500',
  warning:
    'bg-warning-50 text-warning-600 border-warning-500/20 dark:bg-warning-500/10 dark:text-warning-500',
  error:
    'bg-error-50 text-error-700 border-error-500/20 dark:bg-error-500/10 dark:text-error-500',
};

export function Badge({ tone = 'brand', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
