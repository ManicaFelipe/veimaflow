import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/backendApi';
import { toast } from 'react-toastify';

export default function DashboardExecutivoPage() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await dashboardService.obterExecutivo();
      setItens(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.message || 'Falha ao carregar resumo executivo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">Dashboard Executivo</h1>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Atualizar</button>
        </div>
      </div>

      {loading && <div className="text-center py-8 text-gray-500">Carregando…</div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itens.map((i) => (
            <ProjetoCard key={i.projetoId} item={i} />
          ))}
          {(!itens || itens.length === 0) && (
            <div className="text-sm text-gray-500">Sem projetos para exibir.</div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjetoCard({ item }) {
  const cor = item.rag === 'R' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    : item.rag === 'A' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
  const rotulo = item.rag === 'R' ? 'Crítico' : item.rag === 'A' ? 'Atenção' : 'OK';
  return (
    <div className="rounded border dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-semibold">{item.projetoNome || `Projeto #${item.projetoId}`}</div>
        <span className={`px-2 py-1 text-xs rounded ${cor}`}>{rotulo}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mt-2">
        <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/40">
          <div className="text-gray-500">Total</div>
          <div className="text-lg font-bold">{item.totalTarefas}</div>
        </div>
        <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/40">
          <div className="text-gray-500">Concluídas</div>
          <div className="text-lg font-bold">{item.tarefasConcluidas}</div>
        </div>
        <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/40">
          <div className="text-gray-500">Em andamento</div>
          <div className="text-lg font-bold">{item.tarefasEmAndamento}</div>
        </div>
        <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/40">
          <div className="text-gray-500">Pendentes</div>
          <div className="text-lg font-bold">{item.tarefasPendentes}</div>
        </div>
        <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/40 col-span-2">
          <div className="text-gray-500">Vencidas</div>
          <div className="text-lg font-bold">{item.tarefasVencidas}</div>
        </div>
      </div>
    </div>
  );
}
