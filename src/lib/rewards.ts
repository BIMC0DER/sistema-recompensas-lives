import type { TipoRecompensa } from '@/types';
import { Code2, BookOpen, Headphones, Ticket, type LucideIcon } from 'lucide-react';

export interface RewardDefinition {
  tipo: TipoRecompensa;
  marco: number;
  titulo: string;
  descricao: string;
  link: string;
  icon: LucideIcon;
  /** Tailwind classes — gradient utilizado no card */
  gradient: string;
}

/**
 * TODO (pendente): trocar os `link` placeholder pelos URLs reais de cada
 * recompensa (Notion / Drive / página de cupom / convite plantão).
 * O frontend usa este arquivo apenas para apresentação;
 * o desbloqueio real é feito pela RPC `registrar_presenca`.
 */
export const REWARDS: RewardDefinition[] = [
  {
    tipo: 'prompt_pyrevit',
    marco: 5,
    titulo: 'Modelo de Prompt',
    descricao: 'Template testado para gerar pushbuttons pyRevit com IA.',
    link: 'https://bimcoder.net/recompensas/prompt-pyrevit',
    icon: Code2,
    gradient: 'from-brand-500 to-brand-700',
  },
  {
    tipo: 'ebook',
    marco: 10,
    titulo: 'Mini E-book: Fundamentos',
    descricao: 'Guia rápido dos fundamentos de automação no Revit.',
    link: 'https://bimcoder.net/recompensas/ebook-fundamentos',
    icon: BookOpen,
    gradient: 'from-blue-500 to-brand-600',
  },
  {
    tipo: 'plantao',
    marco: 15,
    titulo: 'Plantão Tira-Dúvidas',
    descricao: 'Convite para o próximo plantão ao vivo comigo.',
    link: 'https://bimcoder.net/recompensas/plantao',
    icon: Headphones,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    tipo: 'cupom',
    marco: 25,
    titulo: 'Cupom de 40% OFF',
    descricao: 'Desconto exclusivo no próximo lançamento.',
    link: 'https://bimcoder.net/recompensas/cupom-40',
    icon: Ticket,
    gradient: 'from-amber-500 to-orange-600',
  },
];

/** Próximo marco a partir do streak atual. Retorna null se já atingiu o último. */
export function proximoMarco(streak: number): RewardDefinition | null {
  return REWARDS.find((r) => r.marco > streak) ?? null;
}

/** Quantas lives faltam para o próximo marco. */
export function livesParaProximoMarco(streak: number): number | null {
  const prox = proximoMarco(streak);
  if (!prox) return null;
  return prox.marco - streak;
}

/** Recompensas já desbloqueadas pelo streak atual. */
export function recompensasConquistadas(streak: number): RewardDefinition[] {
  return REWARDS.filter((r) => streak >= r.marco);
}

/** Acabou de desbloquear nesta presença? */
export function recompensaRecemDesbloqueada(
  streakAtual: number,
  streakAnterior: number
): RewardDefinition | null {
  return (
    REWARDS.find((r) => streakAtual >= r.marco && streakAnterior < r.marco) ?? null
  );
}
