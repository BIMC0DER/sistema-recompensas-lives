import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, ...rest },
  ref
) {
  const inputId = id ?? rest.name ?? `ta-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-gray-900 shadow-untitled-xs placeholder:text-gray-400',
          'focus:outline-none focus:ring-4',
          'dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500',
          error
            ? 'border-error-300 focus:border-error-500 focus:ring-error-100 dark:border-error-700 dark:focus:ring-error-900'
            : 'border-gray-300 focus:border-brand-500 focus:ring-brand-100 dark:border-gray-700 dark:focus:ring-brand-900',
          'disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800',
          className
        )}
        {...rest}
      />
      {error ? (
        <p className="mt-1.5 text-sm text-error-600 dark:text-error-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
});
