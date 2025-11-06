import React, { useEffect, useState } from 'react';
import { dashboardService, projetoService } from '../services/backendApi';
import { toast } from 'react-toastify';

export default function DashboardPage() {
  const [metricas, setMetricas] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [projetoId, setProjetoId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjetos();
    loadMetricas();
  }, []);

  async function loadProjetos() {
    try {
      const data = await projetoService.listarProjetos();
      setProjetos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Erro ao carregar projetos:', e);
    }
  }

  async function loadMetricas(filtroProjetoId = null) {
    try {
      setLoading(true);
      const data = await dashboardService.obterMetricas(filtroProjetoId);
      setMetricas(data);
    } catch (e) {
      toast.error(e?.message || 'Falha ao carregar métricas');
    } finally {
      setLoading(false);
    }
  }

  function handleFiltroChange(e) {
    const valor = e.target.value;
    setProjetoId(valor);
    loadMetricas(valor || null);
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">Dashboard Operacional</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => loadMetricas(projetoId || null)} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            Atualizar
          </button>
          <select value={projetoId} onChange={handleFiltroChange} className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 text-sm">
            <option value="">Todos os projetos</option>
            {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">Carregando métricas…</div>
      )}

      {!loading && metricas && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total de Tarefas" value={metricas.totalTarefas} icon="📋" color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
            <MetricCard title="WIP (Em Andamento)" value={metricas.wip} icon="⚡" color="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" />
            <MetricCard title="Concluídas" value={metricas.tarefasConcluidas} icon="✅" color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
            <MetricCard title="Vencidas" value={metricas.tarefasVencidas} icon="⚠️" color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded border dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Lead Time Médio</div>
              <div className="text-2xl font-bold">{metricas.leadTimeMediaDias?.toFixed(1) || '0.0'} dias</div>
              <div className="text-xs text-gray-500 mt-2">Tempo da criação até conclusão</div>
            </div>
            <div className="rounded border dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cycle Time Médio</div>
              <div className="text-2xl font-bold">{metricas.cycleTimeMediaDias?.toFixed(1) || '0.0'} dias</div>
              <div className="text-xs text-gray-500 mt-2">Tempo de "Em andamento" até "Concluída"</div>
            </div>
            <div className="rounded border dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Taxa de Conclusão</div>
              <div className="text-2xl font-bold">
                {metricas.totalTarefas > 0 ? ((metricas.tarefasConcluidas / metricas.totalTarefas) * 100).toFixed(1) : '0.0'}%
              </div>
              <div className="text-xs text-gray-500 mt-2">Tarefas concluídas / total</div>
            </div>
          </div>

          <div className="rounded border dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Breakdown por Status</h2>
            <div className="space-y-3">
              <StatusBar label="Pendentes" valor={metricas.tarefasPendentes} total={metricas.totalTarefas} cor="bg-gray-400" />
              <StatusBar label="Em Andamento" valor={metricas.tarefasEmAndamento} total={metricas.totalTarefas} cor="bg-yellow-500" />
              <StatusBar label="Concluídas" valor={metricas.tarefasConcluidas} total={metricas.totalTarefas} cor="bg-green-500" />
              <StatusBar label="Vencidas" valor={metricas.tarefasVencidas} total={metricas.totalTarefas} cor="bg-red-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <div className={`rounded border dark:border-gray-700 p-6 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium mb-1">{title}</div>
          <div className="text-3xl font-bold">{value}</div>
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
    </div>
  );
}

function StatusBar({ label, valor, total, cor }) {
  const percentual = total > 0 ? (valor / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">{valor} ({percentual.toFixed(0)}%)</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div className={`${cor} h-2.5 rounded-full transition-all`} style={{ width: `${percentual}%` }} />
      </div>
    </div>
  );
}
