import { Link } from 'react-router-dom';
import { ShieldCheck, LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { LiveConfigForm } from '@/components/admin/LiveConfigForm';
import { RankingTable } from '@/components/admin/RankingTable';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuth, signOut } from '@/hooks/useAuth';

export function AdminPage() {
  const { session, isAdmin, loading, checkingAdmin, user } = useAuth();

  // Carregando sessão inicial
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    );
  }

  // Sem sessão
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
        <div className="mx-auto max-w-md py-16">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para alunos
          </Link>
          <AdminLogin />
        </div>
      </div>
    );
  }

  // Logado mas não é admin
  if (!checkingAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
        <div className="mx-auto max-w-md py-16">
          <Card className="animate-slide-up">
            <CardBody className="space-y-4 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Acesso negado
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Sua conta <strong>{user?.email}</strong> não está autorizada
                  como admin.
                </p>
              </div>
              <Button
                variant="secondary"
                fullWidth
                onClick={signOut}
                icon={<LogOut className="h-4 w-4" />}
              >
                Sair
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Logado E admin → painel
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
                Painel do Professor
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-untitled-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Formulário
            </Link>
            <Button
              variant="ghost"
              size="sm"
              icon={<LogOut className="h-4 w-4" />}
              onClick={signOut}
            >
              Sair
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <LiveConfigForm />
        <RankingTable />
      </main>
    </div>
  );
}
