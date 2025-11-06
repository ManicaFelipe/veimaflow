import React, { useEffect, useMemo, useState } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import { tarefaService, projetoService, comentarioService, subtarefaService, dependenciaService, slaService, anexoService } from '../services/backendApi';
import { toast } from 'react-toastify';

export default function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('kanban'); // 'kanban' | 'timeline'
  const [projetos, setProjetos] = useState([]);
  const [projetoId, setProjetoId] = useState('');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    load();
    loadProjetos();
  }, []);

  // Recarrega lista de projetos quando houver alterações vindas de outras telas
  useEffect(() => {
    function onProjetosChanged() {
      loadProjetos();
    }
    window.addEventListener('projetos:changed', onProjetosChanged);
    return () => window.removeEventListener('projetos:changed', onProjetosChanged);
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await tarefaService.listarTarefas();
      setTarefas(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.message || 'Falha ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }

  async function loadProjetos() {
    try {
      const data = await projetoService.listarProjetos();
      setProjetos(Array.isArray(data) ? data : []);
    } catch {}
  }

  const filtered = useMemo(() => {
    let rows = [...tarefas];
    if (projetoId) rows = rows.filter(t => String(t.projetoId ?? t.projeto?.id ?? '') === String(projetoId));
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(t => (t.nome || t.titulo || '').toLowerCase().includes(q) || (t.descricao || '').toLowerCase().includes(q));
    }
    return rows;
  }, [tarefas, projetoId, query]);

  // Export helpers
  function exportCsv(rows) {
    const cols = ['ID','Nome','Status','Projeto','Início','Fim'];
    const header = cols.join(',');
    const lines = rows.map(t => [
      t.id,
      JSON.stringify(t.nome || t.titulo || ''),
      JSON.stringify(t.status || ''),
      JSON.stringify(t.projeto?.nome || t.projetoNome || t.projetoId || ''),
      JSON.stringify(t.dataInicio || ''),
      JSON.stringify(t.dataFim || ''),
    ].join(','));
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tarefas.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">Tarefas</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => { load(); loadProjetos(); }} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Atualizar</button>
          <button onClick={() => exportCsv(filtered)} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Exportar CSV</button>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Nova tarefa</button>
          <select value={view} onChange={e => setView(e.target.value)} className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 text-sm">
            <option value="kanban">Kanban</option>
            <option value="timeline">Timeline</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nome/descrição" className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" />
        <select value={projetoId} onChange={e => setProjetoId(e.target.value)} className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700">
          <option value="">Todos os projetos</option>
          {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">Carregando tarefas…</div>
      )}

      {!loading && view === 'kanban' && (
        <KanbanBoard projetoId={projetoId || null} tasks={filtered} onTasksChange={setTarefas} onTaskClick={(t) => { setEditing(t); setModalOpen(true); }} />
      )}

      {!loading && view === 'timeline' && (
        <TimelineView tasks={filtered} onTaskClick={(t) => { setEditing(t); setModalOpen(true); }} />
      )}

      {modalOpen && (
        <TaskModal
          projetos={projetos}
          initial={editing ? {
            id: editing.id,
            nome: editing.nome || editing.titulo || '',
            descricao: editing.descricao || '',
            status: editing.status || '',
            projetoId: editing.projeto?.id || editing.projetoId || '',
            dataInicio: editing.dataInicio || '',
            dataFim: editing.dataFim || '',
          } : { nome: '', descricao: '', status: '', projetoId: projetoId || '', dataInicio: '', dataFim: '' }}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          onSave={async (form) => {
            try {
              if (editing) {
                await tarefaService.atualizarTarefa(editing.id, form);
                toast.success('Tarefa atualizada');
              } else {
                await tarefaService.criarTarefa(form);
                toast.success('Tarefa criada');
              }
              setModalOpen(false);
              setEditing(null);
              await load();
            } catch (e) {
              toast.error(e?.message || 'Falha ao salvar tarefa');
            }
          }}
        />
      )}
    </div>
  );
}

function TimelineView({ tasks, onTaskClick }) {
  // Determine overall range
  const parse = (d) => d ? new Date(d) : null;
  const validTasks = tasks.filter(t => parse(t.dataInicio) && parse(t.dataFim));
  if (!validTasks.length) {
    return <div className="text-sm text-gray-500">Sem tarefas com datas para exibir a timeline.</div>;
  }
  const minDate = new Date(Math.min(...validTasks.map(t => +parse(t.dataInicio))));
  const maxDate = new Date(Math.max(...validTasks.map(t => +parse(t.dataFim))));
  const totalMs = Math.max(1, (+maxDate) - (+minDate));

  const [zoom, setZoom] = useState(1); // 1 to 3
  const [showDeps, setShowDeps] = useState(false);
  const [depCounts, setDepCounts] = useState({}); // { [taskId]: number }

  useEffect(() => {
    let cancelled = false;
    async function loadDeps() {
      if (!showDeps) return;
      const ids = validTasks.map(t => t.id).filter(Boolean);
      const entries = await Promise.all(ids.map(async id => {
        try {
          const data = await dependenciaService.listar(id);
          return [id, (data && Array.isArray(data.bloqueadoPor)) ? data.bloqueadoPor.length : 0];
        } catch {
          return [id, 0];
        }
      }));
      if (!cancelled) {
        const map = {};
        entries.forEach(([id, n]) => { map[id] = n; });
        setDepCounts(map);
      }
    }
    loadDeps();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeps, tasks]);
  const today = new Date();
  const todayPct = Math.min(100, Math.max(0, ((+today - (+minDate)) / totalMs) * 100));

  // Group by project
  const groups = {};
  validTasks.forEach(t => {
    const key = t.projeto?.id || t.projetoId || '—';
    if (!groups[key]) groups[key] = { nome: t.projeto?.nome || t.projetoNome || `Projeto ${key}`, rows: [] };
    groups[key].rows.push(t);
  });

  const statusColor = (s) => {
    if (!s) return 'bg-gray-300';
    const k = (s + '').toLowerCase();
    if (k.includes('andament')) return 'bg-amber-400';
    if (k.includes('conclu')) return 'bg-emerald-500';
    if (k.includes('planej')) return 'bg-sky-400';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <div className="px-2 py-1 rounded border dark:border-gray-700">Período: {minDate.toLocaleDateString()} – {maxDate.toLocaleDateString()}</div>
        <label className="flex items-center gap-2">Zoom
          <input type="range" min={1} max={3} step={1} value={zoom} onChange={e => setZoom(parseInt(e.target.value,10))} />
          <span>{zoom}x</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showDeps} onChange={e => setShowDeps(e.target.checked)} />
          Mostrar dependências (contagem)
        </label>
      </div>
      {Object.entries(groups).map(([pid, g]) => (
        <div key={pid} className="border rounded dark:border-gray-700">
          <div className="px-3 py-2 border-b dark:border-gray-700 font-semibold">{g.nome}</div>
          <div className="p-3 space-y-3 overflow-x-auto">
            <div className="relative h-0" style={{ width: `${zoom*100}%` }}>
              {/* today marker across group area */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/70" style={{ left: `${todayPct}%` }} />
            </div>
            {g.rows.sort((a,b) => new Date(a.dataInicio) - new Date(b.dataInicio)).map(t => {
              const di = parse(t.dataInicio);
              const df = parse(t.dataFim);
              const left = ((+di - (+minDate)) / totalMs) * 100;
              const width = Math.max(1, ((+df - (+di)) / totalMs) * 100);
              return (
                <div key={t.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">
                      {t.nome || t.titulo || `Tarefa #${t.id}`}
                      {typeof t.progressoPercent === 'number' && <span className="ml-2 text-gray-500">({t.progressoPercent}%)</span>}
                    </div>
                    <div className="text-gray-500">{new Date(di).toLocaleDateString()} - {new Date(df).toLocaleDateString()}</div>
                  </div>
                  <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden" style={{ width: `${zoom*100}%` }}>
                    <div className={`absolute top-0 h-6 rounded ${statusColor(t.status)} cursor-pointer flex items-center justify-center text-[10px] text-white/90`} style={{ left: `${left}%`, width: `${width}%` }} onClick={() => onTaskClick && onTaskClick(t)}>
                      {typeof t.progressoPercent === 'number' && t.progressoPercent > 0 ? `${t.progressoPercent}%` : ''}
                    </div>
                    {showDeps && (
                      <div className="absolute -top-2 right-1 text-[10px] px-1 rounded bg-gray-800 text-white">
                        {(depCounts[t.id] ?? 0)}
                      </div>
                    )}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/70" style={{ left: `${todayPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskModal({ initial, onSave, onCancel, projetos }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.nome?.trim()) { toast.error('Informe o nome da tarefa'); return; }
    if (!form.projetoId) { toast.error('Selecione o projeto da tarefa'); return; }
    try {
      setSaving(true);
          const payload = {
            titulo: form.nome?.trim(),
            descricao: form.descricao?.trim() || '',
            status: form.status || undefined,
            projetoId: form.projetoId || '',
          };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <form onSubmit={submit} className="relative z-40 w-full max-w-2xl bg-white dark:bg-gray-800 rounded shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">{initial.id ? 'Editar tarefa' : 'Nova tarefa'}</h2>
        <div>
          <label className="block text-sm mb-1">Nome</label>
          <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" value={form.nome} onChange={e => update('nome', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Descrição</label>
          <textarea className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" rows={3} value={form.descricao} onChange={e => update('descricao', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="">Padrão (Não iniciado)</option>
              <option value="NAO_INICIADO">Não iniciado</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Projeto</label>
            <select className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" value={form.projetoId} onChange={e => update('projetoId', e.target.value)}>
              <option value="">Selecione…</option>
              {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Início</label>
            <input type="date" className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" value={form.dataInicio} onChange={e => update('dataInicio', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Fim</label>
            <input type="date" className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" value={form.dataFim} onChange={e => update('dataFim', e.target.value)} />
          </div>
        </div>
        {initial.id && (
          <div className="pt-4 border-t dark:border-gray-700 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">SLA (Tempo por Status)</h3>
              <SlaSection tarefaId={initial.id} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Anexos</h3>
              <AttachmentsSection tarefaId={initial.id} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Comentários</h3>
              <CommentsSection tarefaId={initial.id} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Subtarefas</h3>
              <SubtasksSection tarefaId={initial.id} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Dependências</h3>
              <DependenciesSection tarefaId={initial.id} />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
          <button type="submit" disabled={saving} className={`px-4 py-2 rounded text-white ${saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{saving ? 'Salvando…' : (initial.id ? 'Salvar' : 'Criar')}</button>
        </div>
      </form>
    </div>
  );
}

function SlaSection({ tarefaId }) {
  const [sla, setSla] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, [tarefaId]);

  async function load() {
    try {
      setLoading(true);
      const data = await slaService.obterSlaTarefa(tarefaId);
      setSla(data);
    } catch (e) {
      // já tratado globalmente
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Carregando SLA…</div>;
  if (!sla) return <div className="text-sm text-gray-500">Sem dados de SLA.</div>;

  return (
    <div className="p-2 rounded border dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <div className="text-xs text-gray-500">Status atual</div>
          <div className="font-medium">{sla.statusAtual || '—'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Tempo total</div>
          <div className="font-medium">{sla.tempoTotalFormatado || '—'}</div>
        </div>
      </div>
      <div className="space-y-2">
        {(sla.temposPorStatus || []).map((s) => (
          <div key={s.status} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">{s.status}</span>
            <span className="font-medium">{s.tempoFormatado} ({s.tempoSegundos}s)</span>
          </div>
        ))}
        {(!sla.temposPorStatus || sla.temposPorStatus.length === 0) && (
          <div className="text-sm text-gray-500">Sem histórico de status.</div>
        )}
      </div>
    </div>
  );
}

function AttachmentsSection({ tarefaId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, [tarefaId]);

  async function load() {
    try {
      setLoading(true);
      const data = await anexoService.listar(tarefaId);
      setRows(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }

  async function onSelectFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      await anexoService.upload(tarefaId, file);
      toast.success('Anexo enviado');
      await load();
    } catch (err) {
      // handled globally
    } finally {
      setUploading(false);
      try { e.target.value = ''; } catch {}
    }
  }

  async function download(id, nome) {
    try {
      const resp = await anexoService.download(id);
      const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = nome || `anexo-${id}`; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  async function remove(id) {
    try {
      await anexoService.remover(id);
      toast.success('Anexo removido');
      setRows(prev => prev.filter(r => r.id !== id));
    } catch {}
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 cursor-pointer">
          <input type="file" className="hidden" onChange={onSelectFile} disabled={uploading} />
          <span className="text-sm">{uploading ? 'Enviando…' : 'Enviar arquivo'}</span>
        </label>
      </div>
      {loading && <div className="text-sm text-gray-500">Carregando anexos…</div>}
      {!loading && (
        <ul className="space-y-2 max-h-48 overflow-auto pr-1">
          {rows.map(a => (
            <li key={a.id} className="p-2 rounded border dark:border-gray-700 flex items-center gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium">{a.nomeArquivo || `Anexo #${a.id}`}</div>
                <div className="text-xs text-gray-500">{a.contentType || 'application/octet-stream'} • {(a.tamanho || 0).toLocaleString()} bytes</div>
              </div>
              <button onClick={() => download(a.id, a.nomeArquivo)} className="px-2 py-1 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Baixar</button>
              <button onClick={() => remove(a.id)} className="px-2 py-1 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Excluir</button>
            </li>
          ))}
          {rows.length === 0 && <li className="text-sm text-gray-500">Sem anexos.</li>}
        </ul>
      )}
    </div>
  );
}

function CommentsSection({ tarefaId }) {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [texto, setTexto] = useState('');
  const [autor, setAutor] = useState('');

  useEffect(() => { load(); }, [tarefaId]);

  async function load() {
    try {
      setLoading(true);
      const data = await comentarioService.listar(tarefaId);
      setComentarios(Array.isArray(data) ? data : []);
    } catch (e) {
      // silent fail; already toasted globally
    } finally {
      setLoading(false);
    }
  }

  async function addComment(e) {
    e.preventDefault();
    if (!texto.trim()) { toast.error('Digite um comentário'); return; }
    try {
      const novo = await comentarioService.criar(tarefaId, { conteudo: texto, autorNome: autor });
      setComentarios(prev => [...prev, novo]);
      setTexto('');
    } catch {}
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input
            className="md:col-span-5 px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700"
            placeholder="Escreva um comentário (suporta @menções como texto)"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(e); } }}
          />
          <button onClick={addComment} className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Enviar</button>
        </div>
        <input
          className="w-64 px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700"
          placeholder="Seu nome (opcional)"
          value={autor}
          onChange={e => setAutor(e.target.value)}
        />
      </div>

      {loading && <div className="text-sm text-gray-500">Carregando comentários…</div>}
      {!loading && (
        <ul className="space-y-2 max-h-64 overflow-auto pr-1">
          {comentarios.map(c => (
            <li key={c.id} className="p-2 rounded border dark:border-gray-700">
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>{c.autorNome || 'Anônimo'}</span>
                <span>{new Date(c.criadoEm).toLocaleString()}</span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{c.conteudo}</div>
            </li>
          ))}
          {(!comentarios || comentarios.length === 0) && <li className="text-sm text-gray-500">Sem comentários ainda.</li>}
        </ul>
      )}
    </div>
  );
}

function DependenciesSection({ tarefaId }) {
  const [deps, setDeps] = useState({ bloqueia: [], bloqueadoPor: [] });
  const [loading, setLoading] = useState(false);
  const [novoId, setNovoId] = useState('');

  useEffect(() => { load(); }, [tarefaId]);

  async function load() {
    try {
      setLoading(true);
      const data = await dependenciaService.listar(tarefaId);
      setDeps({ bloqueia: data.bloqueia || [], bloqueadoPor: data.bloqueadoPor || [] });
    } finally {
      setLoading(false);
    }
  }

  async function add(e) {
    e.preventDefault();
    const id = Number(novoId);
    if (!id || isNaN(id)) { toast.error('Informe um ID de tarefa válido'); return; }
    if (id === Number(tarefaId)) { toast.error('Uma tarefa não pode depender dela mesma'); return; }
    await dependenciaService.adicionar(tarefaId, id);
    setNovoId('');
    load();
  }

  async function remove(id) {
    await dependenciaService.remover(tarefaId, id);
    load();
  }

  return (
    <div className="space-y-3">
      <form onSubmit={add} className="flex gap-2">
        <input className="w-48 px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" placeholder="ID da tarefa pré-requisito" value={novoId} onChange={e => setNovoId(e.target.value)} />
        <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Adicionar</button>
      </form>
      {loading && <div className="text-sm text-gray-500">Carregando…</div>}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-2 rounded border dark:border-gray-700">
            <div className="font-medium mb-1">Bloqueado por</div>
            <ul className="space-y-1">
              {(deps.bloqueadoPor || []).map(id => (
                <li key={id} className="flex items-center justify-between text-sm">
                  <span>Tarefa #{id}</span>
                  <button onClick={() => remove(id)} className="px-2 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-700">Remover</button>
                </li>
              ))}
              {(!deps.bloqueadoPor || deps.bloqueadoPor.length === 0) && <li className="text-sm text-gray-500">Nenhuma</li>}
            </ul>
          </div>
          <div className="p-2 rounded border dark:border-gray-700">
            <div className="font-medium mb-1">Bloqueia</div>
            <ul className="space-y-1">
              {(deps.bloqueia || []).map(id => (
                <li key={id} className="text-sm">Tarefa #{id}</li>
              ))}
              {(!deps.bloqueia || deps.bloqueia.length === 0) && <li className="text-sm text-gray-500">Nenhuma</li>}
            </ul>
          </div>
        </div>
      )}
      <div className="text-xs text-gray-500">Observação: validação de ciclos complexos será adicionada em breve.</div>
    </div>
  );
}

function SubtasksSection({ tarefaId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState('');

  useEffect(() => { load(); }, [tarefaId]);

  async function load() {
    try {
      setLoading(true);
      const data = await subtarefaService.listar(tarefaId);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function addSubtask(e) {
    e.preventDefault();
    if (!titulo.trim()) { toast.error('Informe um título'); return; }
    const nova = await subtarefaService.criar(tarefaId, { titulo });
    setRows(prev => [...prev, nova]);
    setTitulo('');
  }

  async function changeStatus(id, status) {
    const updated = await subtarefaService.atualizar(id, { status });
    setRows(prev => prev.map(r => r.id === id ? updated : r));
  }

  async function remove(id) {
    await subtarefaService.remover(id);
    setRows(prev => prev.filter(r => r.id !== id));
  }

  const statusOptions = [
    { v: 'NAO_INICIADO', l: 'Não iniciado' },
    { v: 'EM_ANDAMENTO', l: 'Em andamento' },
    { v: 'CONCLUIDA', l: 'Concluída' },
    { v: 'CANCELADA', l: 'Cancelada' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input 
          className="flex-1 px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" 
          placeholder="Nova subtarefa" 
          value={titulo} 
          onChange={e => setTitulo(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(e); } }}
        />
        <button onClick={addSubtask} className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Adicionar</button>
      </div>
      {loading && <div className="text-sm text-gray-500">Carregando…</div>}
      {!loading && (
        <ul className="space-y-2">
          {rows.map(s => (
            <li key={s.id} className="p-2 rounded border dark:border-gray-700 flex items-center gap-2">
              <div className="flex-1">
                <div className="font-medium text-sm">{s.titulo}</div>
              </div>
              <select className="px-2 py-1 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 text-sm" value={s.status || ''} onChange={e => changeStatus(s.id, e.target.value)}>
                {statusOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              <button onClick={() => remove(s.id)} className="px-2 py-1 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Excluir</button>
            </li>
          ))}
          {rows.length === 0 && <li className="text-sm text-gray-500">Sem subtarefas.</li>}
        </ul>
      )}
    </div>
  );
}
