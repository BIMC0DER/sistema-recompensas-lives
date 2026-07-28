import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white shadow-untitled-sm',
        'dark:border-gray-800 dark:bg-gray-900',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'border-b border-gray-100 px-6 py-5 dark:border-gray-800',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: CardProps) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-gray-900 dark:text-gray-50',
        className
      )}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...rest }: CardProps) {
  return (
    <p className={cn('mt-1 text-sm text-gray-500 dark:text-gray-400', className)} {...rest}>
      {children}
    </p>
  );
}

export function CardBody({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn('px-6 py-5', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'border-t border-gray-100 px-6 py-4 dark:border-gray-800',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
