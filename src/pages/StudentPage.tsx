import { Sparkles } from 'lucide-react';
import { StudentForm } from '@/components/student/StudentForm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function StudentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-untitled-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
              BIM Coder Lives
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Gamificação de presença
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
            Lista de Presença
          </h1>
          <p className="mt-2 text-base font-medium text-brand-600 dark:text-brand-400">
            Live BIM Coder
          </p>
        </div>
        <StudentForm />
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500">
        BIM Coder · @bimcoder · contato@bimcoder.net
      </footer>
    </div>
  );
}
