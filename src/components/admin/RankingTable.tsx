import { useEffect, useState } from 'react';
import { Trophy, Flame, RefreshCcw, Users } from 'lucide-react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { RankingUsuario } from '@/types';
import { cn } from '@/lib/utils';

export function RankingTable() {
  const [rows, setRows] = useState<RankingUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('app_bimcoderlives_ranking_usuarios')
      .select('*')
      .order('streak', { ascending: false })
      .order('total_lives', { ascending: false })
      .limit(100);
    if (!error && data) setRows(data as RankingUsuario[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Ranking de alunos</CardTitle>
            <CardDescription>
              Top 100 ordenado por sequência atual.
            </CardDescription>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCcw className="h-4 w-4" />}
            onClick={load}
            loading={loading}
          >
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            Carregando...
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm text-gray-500">
              Ainda não há alunos registrados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Aluno</th>
                  <th className="px-4 py-3 text-right font-semibold">Sequência</th>
                  <th className="px-4 py-3 text-right font-semibold">Recorde</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Última</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((u, i) => (
                  <tr
                    key={u.id}
                    className="text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 font-semibold">
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                          i === 0 && 'bg-amber-100 text-amber-700 dark:bg-amber-500/20',
                          i === 1 && 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
                          i === 2 && 'bg-orange-100 text-orange-700 dark:bg-orange-500/20',
                          i > 2 && 'text-gray-500'
                        )}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {u.nome}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {u.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge tone="brand">
                        <Flame className="h-3 w-3" />
                        {u.streak}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        {u.maior_streak}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {u.total_lives}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      {new Date(u.ultima_presenca).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
