import React, { useEffect, useMemo, useState } from 'react';
import { tarefaService } from '../services/backendApi';
import { toast } from 'react-toastify';

/**
 * KanbanBoard
 * - Columns by task status
 * - Drag & drop cards between columns to update status (optimistic)
 * - Optional filtering by projetoId via props
 * - Can accept external tasks via props (controlled mode)
 */
export default function KanbanBoard({ projetoId = null, tasks: externalTasks = null, onTasksChange, onTaskClick }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const controlled = Array.isArray(externalTasks);

  useEffect(() => {
    if (controlled) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tarefaService.listarTarefas();
        if (!active) return;
        const rows = Array.isArray(data) ? data : [];
        setTasks(rows);
      } catch (e) {
        if (!active) return;
        setError(e?.message || 'Falha ao carregar tarefas');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [controlled]);

  const allTasks = controlled ? externalTasks : tasks;
  const filtered = useMemo(() => {
    let rows = Array.isArray(allTasks) ? allTasks : [];
    if (projetoId != null) rows = rows.filter(t => String(t.projetoId ?? t.projeto?.id ?? '') === String(projetoId));
    return rows;
  }, [allTasks, projetoId]);

  const statuses = useMemo(() => {
    const s = new Set();
    filtered.forEach(t => { if (t.status) s.add(t.status); });
    if (s.size === 0) return ['Planejado', 'Em andamento', 'Concluído'];
    return Array.from(s);
  }, [filtered]);

  function updateLocalTasks(next) {
    if (controlled) {
      onTasksChange && onTasksChange(next);
    } else {
      setTasks(next);
    }
  }

  function onDragStart(e, task) {
    e.dataTransfer.setData('text/task-id', String(task.id));
    e.dataTransfer.setData('text/task-status', String(task.status || ''));
  }

  function onDropStatus(e, newStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/task-id');
    const fromStatus = e.dataTransfer.getData('text/task-status');
    if (!id || fromStatus === newStatus) return;

    const idNum = isNaN(Number(id)) ? id : Number(id);
    // optimistic update
    const next = (allTasks || []).map(t => (t.id === idNum ? { ...t, status: newStatus } : t));
    updateLocalTasks(next);

    tarefaService
      .atualizarStatusTarefa(idNum, newStatus)
      .then(() => {
        toast.success('Status atualizado');
      })
      .catch((err) => {
        // revert on error
        updateLocalTasks((allTasks || []).map(t => (t.id === idNum ? { ...t, status: fromStatus } : t)));
        toast.error(err?.message || 'Falha ao atualizar status');
      });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Kanban</h2>
        {loading && <div className="text-sm text-gray-500">Carregando…</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {statuses.map((s) => (
          <div
            key={s}
            className="rounded border dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 min-h-[300px] flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDropStatus(e, s)}
          >
            <div className="px-3 py-2 border-b dark:border-gray-700 font-semibold text-sm flex items-center justify-between">
              <span>{s}</span>
              <span className="text-gray-500">{filtered.filter(t => (t.status || '') === s).length}</span>
            </div>
            <div className="p-2 space-y-2 flex-1">
              {filtered.filter(t => (t.status || '') === s).map((t) => (
                <TaskCard key={t.id} task={t} onDragStart={onDragStart} onClick={onTaskClick} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TaskCard({ task, onDragStart, onClick }) {
  const title = task.nome || task.titulo || `Tarefa #${task.id}`;
  const proj = task.projeto?.nome || task.projetoNome || task.projetoId || null;
  const di = task.dataInicio ? new Date(task.dataInicio) : null;
  const df = task.dataFim ? new Date(task.dataFim) : null;
  const dateFmt = (d) => (d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '—');
  const progress = typeof task.progressoPercent === 'number' ? task.progressoPercent : null;
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick && onClick(task)}
      className="bg-white dark:bg-gray-900 rounded border dark:border-gray-700 p-3 shadow-sm cursor-grab"
    >
      <div className="font-medium text-sm flex items-center gap-2">
        {typeof task.ordem !== 'undefined' && (
          <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">#{task.ordem}</span>
        )}
        <span>{title}</span>
        {progress !== null && <span className="text-xs text-gray-500">({progress}%)</span>}
      </div>
      {proj && <div className="text-xs text-gray-500">Projeto: {proj}</div>}
      <div className="mt-2 text-xs text-gray-500">Início: {dateFmt(di)} • Fim: {dateFmt(df)}</div>
      {progress !== null && (
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
