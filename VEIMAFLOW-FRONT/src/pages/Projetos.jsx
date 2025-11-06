import React, { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import { projetoService, usuarioService, timeService, marcoService } from '../services/backendApi';
import { FiPlus, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiTrash2, FiDownload, FiEdit, FiX, FiSettings, FiCopy, FiInfo, FiTag, FiUser } from 'react-icons/fi';
import { getStatusBadgeClasses } from '../config/statusColors';
import { toast } from 'react-toastify';

// Lazy-load react-window to avoid bundler warnings about named/default exports
const List = lazy(() => import('react-window').then(m => ({
  default: m.FixedSizeList || (m.default && m.default.FixedSizeList)
})));

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function exportCsv(rows, columns) {
  const visibleCols = columns.filter(c => c.visible);
  const header = visibleCols.map(c => '"' + c.label.replace(/"/g, '""') + '"').join(',');
  const lines = rows.map(r => visibleCols.map(c => {
    const v = c.accessor ? c.accessor(r) : '';
    return '"' + (v != null ? String(v).replace(/"/g, '""') : '') + '"';
  }).join(','));
  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'projetos.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function exportJson(rows, columns) {
  const visible = columns.filter(c => c.visible);
  const mapped = rows.map(r => {
    const o = {};
    visible.forEach(c => { o[c.label] = c.accessor ? c.accessor(r) : ''; });
    return o;
  });
  const blob = new Blob([JSON.stringify(mapped, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'projetos.json';
  a.click();
  URL.revokeObjectURL(url);
}

function StatusBadge({ s }) {
  const cls = getStatusBadgeClasses(s);
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${cls}`}><FiTag/>{s || '—'}</span>;
}

export default function Projetos() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]); // array de strings
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('dataInicio');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [colOpen, setColOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dense, setDense] = useState(false);
  const [detail, setDetail] = useState(null);
  const [groupByStatus, setGroupByStatus] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [savedViewName, setSavedViewName] = useState('');
  const [savedViews, setSavedViews] = useState([]);
  const [useVirtual, setUseVirtual] = useState(false);
  const [virtualHeight, setVirtualHeight] = useState(480);
  const [dragIdx, setDragIdx] = useState(null);
  const [bulkInicio, setBulkInicio] = useState('');
  const [bulkFim, setBulkFim] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [detailUsers, setDetailUsers] = useState({ loading: false, error: null, rows: [] });

  // Colunas padrão e estado configurável (com segurança caso prefs inválidas escondam tudo)
  const defaultColumns = [
    { key: 'nome', label: 'Nome', visible: true, accessor: r => r.nome || '' },
    { key: 'descricao', label: 'Descrição', visible: true, accessor: r => r.descricao || '',
      render: r => <span className="block max-w-[480px] truncate" title={r.descricao || ''}>{r.descricao || ''}</span> },
    { key: 'status', label: 'Status', visible: true, accessor: r => r.status || '', render: r => <StatusBadge s={r.status} /> },
    { key: 'dataInicio', label: 'Início', visible: true, accessor: r => r.dataInicio ? formatDate(r.dataInicio) : '' },
    { key: 'dataFim', label: 'Fim', visible: true, accessor: r => r.dataFim ? formatDate(r.dataFim) : '' },
    { key: 'duracao', label: 'Duração (dias)', visible: false, accessor: r => {
      if (!r.dataInicio || !r.dataFim) return '';
      const di = new Date(r.dataInicio).getTime();
      const df = new Date(r.dataFim).getTime();
      if (Number.isNaN(di) || Number.isNaN(df)) return '';
      return Math.round((df - di) / (1000*60*60*24));
    }}
  ];
  const [columns, setColumns] = useState(defaultColumns);

  // Carregar preferências
  useEffect(() => {
    const saved = localStorage.getItem('projetosView');
    if (saved) {
      try {
        const v = JSON.parse(saved);
        if (Array.isArray(v.columns) && v.columns.length) {
          // Mescla com colunas padrão por chave para evitar desaparecer tudo
          const nextCols = defaultColumns.map(dc => {
            const sv = v.columns.find(c => c && c.key === dc.key);
            return { ...dc, visible: sv && typeof sv.visible === 'boolean' ? sv.visible : dc.visible };
          });
          // Se todas ficaram invisíveis por algum problema, garante ao menos 'nome' visível
          const anyVisible = nextCols.some(c => c.visible);
          setColumns(anyVisible ? nextCols : nextCols.map(c => ({ ...c, visible: c.key === 'nome' ? true : c.visible })));
        }
        if (v.pageSize) setPageSize(v.pageSize);
        if (v.sortBy) setSortBy(v.sortBy);
        if (v.sortDir) setSortDir(v.sortDir);
        if (typeof v.dense === 'boolean') setDense(v.dense);
        if (typeof v.groupByStatus === 'boolean') setGroupByStatus(v.groupByStatus);
      } catch {}
    }
    const views = localStorage.getItem('projetosSavedViews');
    if (views) {
      try { setSavedViews(JSON.parse(views)); } catch {}
    }
  }, []);

  function persistDefaultView() {
    // Persiste apenas visibilidade por chave para evitar lixo
    const minimalCols = columns.map(c => ({ key: c.key, visible: !!c.visible }));
    localStorage.setItem('projetosView', JSON.stringify({ columns: minimalCols, pageSize, sortBy, sortDir, dense, groupByStatus }));
  }

  function saveView() {
    persistDefaultView();
    toast.success('Visualização padrão salva');
  }

  function saveNamedView() {
    if (!savedViewName.trim()) { toast.error('Informe um nome para a vista'); return; }
    const view = { id: Date.now(), name: savedViewName.trim(), columns, pageSize, sortBy, sortDir, dense, groupByStatus };
    const next = [...savedViews, view];
    setSavedViews(next);
    localStorage.setItem('projetosSavedViews', JSON.stringify(next));
    toast.success('Vista salva');
    setSavedViewName('');
  }

  function loadNamedView(id) {
    const v = savedViews.find(x => x.id === Number(id));
    if (!v) return;
    setColumns(v.columns); setPageSize(v.pageSize); setSortBy(v.sortBy); setSortDir(v.sortDir); setDense(!!v.dense); setGroupByStatus(!!v.groupByStatus);
    persistDefaultView();
  }

  function deleteNamedView(id) {
    const next = savedViews.filter(x => x.id !== Number(id));
    setSavedViews(next);
    localStorage.setItem('projetosSavedViews', JSON.stringify(next));
  }

  function resetView() {
    setColumns(columns.map(c => ({ ...c, visible: true })));
    setPageSize(10);
    setSortBy('dataInicio');
    setSortDir('desc');
    setQuery('');
    setStatusFilter([]);
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setDense(false);
    setGroupByStatus(false);
  }

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await projetoService.listarProjetos();
      setAll(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Falha ao carregar projetos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Carrega usuários do time do projeto quando o painel de detalhes abre
  useEffect(() => {
    let active = true;
    async function fetchUsers() {
      if (!detail?.id) { setDetailUsers({ loading: false, error: null, rows: [] }); return; }
      try {
        setDetailUsers(prev => ({ ...prev, loading: true, error: null }));
        const data = await projetoService.listarUsuariosDoProjeto(detail.id);
        if (!active) return;
        const rows = Array.isArray(data) ? data : [];
        setDetailUsers({ loading: false, error: null, rows, fallback: false });
      } catch (e) {
        if (!active) return;
        // Se for erro 500 "No static resource", significa que o backend não tem essa rota implementada
        const msg = e?.response?.data?.message || e?.message || '';
        const optional = msg.includes('No static resource') || e?.response?.status === 500 || e?.response?.status === 404;
        if (optional) {
          // Tenta fallback: listar todos usuários
          try {
            const all = await usuarioService.listar();
            if (!active) return;
            setDetailUsers({ loading: false, error: null, rows: Array.isArray(all) ? all : [], fallback: true });
          } catch (e2) {
            setDetailUsers({ loading: false, error: 'Usuários indisponíveis', rows: [], fallback: true });
          }
        } else {
          setDetailUsers({ loading: false, error: msg || 'Falha ao carregar usuários', rows: [], fallback: false });
        }
      }
    }
    fetchUsers();
    return () => { active = false; };
  }, [detail]);

  const statuses = useMemo(() => {
    const s = new Set();
    all.forEach(p => { if (p.status) s.add(p.status); });
    return Array.from(s).sort();
  }, [all]);

  const filtered = useMemo(() => {
    let rows = [...all];
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(r =>
        (r.nome || '').toLowerCase().includes(q) ||
        (r.descricao || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter.length) {
      rows = rows.filter(r => r.status && statusFilter.includes(r.status));
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      rows = rows.filter(r => !r.dataInicio || new Date(r.dataInicio).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      rows = rows.filter(r => !r.dataFim || new Date(r.dataFim).getTime() <= to);
    }
    rows.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const av = a[sortBy];
      const bv = b[sortBy];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (sortBy === 'dataInicio' || sortBy === 'dataFim') {
        return (new Date(av) - new Date(bv)) * dir;
      }
      return String(av).localeCompare(String(bv)) * dir;
    });
    return rows;
  }, [all, query, statusFilter, dateFrom, dateTo, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  function toggleSelect(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  function toggleAllVisible() {
    const ids = pageRows.map(r => r.id);
    const next = new Set(selected);
    const allSelected = ids.every(id => next.has(id));
    ids.forEach(id => { if (allSelected) next.delete(id); else next.add(id); });
    setSelected(next);
  }

  async function handleBulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Remover ${selected.size} projeto(s)?`)) return;
    try {
      setLoading(true);
      await Promise.all(Array.from(selected).map(id => projetoService.removerProjeto(id)));
      toast.success('Projetos removidos');
      setSelected(new Set());
      await load();
    } catch (e) {
      toast.error(e?.message || 'Erro ao remover');
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkStatusUpdate() {
    if (!selected.size) return;
    if (!bulkStatus.trim()) { toast.error('Informe um status'); return; }
    try {
      setLoading(true);
      await Promise.all(Array.from(selected).map(id => projetoService.atualizarProjeto(id, { status: bulkStatus.trim() })));
      toast.success('Status atualizado');
      setSelected(new Set());
      setBulkOpen(false);
      setBulkStatus('');
      await load();
    } catch (e) {
      toast.error(e?.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkDatesUpdate() {
    if (!selected.size) return;
    if (!bulkInicio && !bulkFim) { toast.error('Informe datas para atualizar'); return; }
    try {
      setLoading(true);
      await Promise.all(Array.from(selected).map(id => projetoService.atualizarProjeto(id, {
        ...(bulkInicio ? { dataInicio: bulkInicio } : {}),
        ...(bulkFim ? { dataFim: bulkFim } : {}),
      })));
      toast.success('Datas atualizadas');
      setSelected(new Set());
      setBulkOpen(false);
      setBulkInicio('');
      setBulkFim('');
      await load();
    } catch (e) {
      toast.error(e?.message || 'Erro ao atualizar datas');
    } finally {
      setLoading(false);
    }
  }

  function handleBulkExportSelected(fmt) {
    const rows = all.filter(r => selected.has(r.id));
    if (!rows.length) { toast.info('Nenhum selecionado'); return; }
    if (fmt === 'csv') exportCsv(rows, columns); else exportJson(rows, columns);
  }

  async function handleBulkDuplicate() {
    const rows = all.filter(r => selected.has(r.id));
    if (!rows.length) { toast.info('Nenhum selecionado'); return; }
    try {
      setLoading(true);
      await Promise.all(rows.map(r => projetoService.criarProjeto({
        nome: `${r.nome} (cópia)`,
        descricao: r.descricao || '',
        status: r.status || '',
        dataInicio: r.dataInicio || null,
        dataFim: r.dataFim || null,
      })));
      toast.success('Projetos duplicados');
      setSelected(new Set());
      await load();
    } catch (e) {
      toast.error(e?.message || 'Erro ao duplicar');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setModalOpen(true);
  }

  async function handleSave(form) {
    try {
      setLoading(true);
      console.log('[Projetos] handleSave chamado com:', form);
      if (editing) {
        console.log('[Projetos] Atualizando projeto ID:', editing.id);
        await projetoService.atualizarProjeto(editing.id, form);
        toast.success('Projeto atualizado');
      } else {
        console.log('[Projetos] Criando novo projeto');
        const result = await projetoService.criarProjeto(form);
        console.log('[Projetos] Projeto criado:', result);
        toast.success('Projeto criado');
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      console.error('[Projetos] Erro ao salvar:', e);
      const msg = e?.response?.data?.message || e?.message || 'Erro ao salvar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const visibleColumns = columns.filter(c => c.visible);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const byStatus = filtered.reduce((acc, r) => { const s = r.status || '—'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
    return { total, byStatus };
  }, [filtered]);

  const rowHeight = dense ? 36 : 48;
  const approxVisible = useMemo(() => Math.ceil(virtualHeight / rowHeight) + 1, [virtualHeight, rowHeight]);

  // Presets rápidos de filtros
  function presetEmAndamento() {
    setStatusFilter(['Em andamento']); setPage(1);
  }
  function presetConcluidos30d() {
    const today = new Date();
    const past = new Date(today.getTime() - 30 * 86400000);
    setStatusFilter(['Concluido', 'Concluida']);
    setDateFrom('');
    setDateTo(formatDate(today));
    // opcionalmente poderíamos filtrar por dataFim >= past, mas usamos dateTo; aqui só deixamos exemplo
    setPage(1);
  }
  function presetAtrasados() {
    // atrasados: dataFim < hoje e não concluído
    const today = new Date();
    setStatusFilter([]); // filtro via cálculo visual; manter vazio e orientar usuário usar ordenação
    setDateTo(formatDate(today));
    setPage(1);
  }
  function presetPlanejados() {
    // planejados: sem dataInicio ou status Planejado
    setStatusFilter(['Planejado']); setPage(1);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Projetos</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCsv(filtered, columns)} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700"><FiDownload className="inline mr-2"/>Exportar CSV</button>
          <button onClick={() => exportJson(filtered, columns)} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700"><FiDownload className="inline mr-2"/>Exportar JSON</button>
          <button onClick={saveView} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700"><FiSettings className="inline mr-2"/>Salvar visualização</button>
          <div className="flex items-center gap-2">
            <input value={savedViewName} onChange={e => setSavedViewName(e.target.value)} placeholder="Nome da vista" className="px-2 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 text-sm" />
            <button onClick={saveNamedView} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Salvar vista</button>
            {savedViews.length > 0 && (
              <select onChange={e => loadNamedView(e.target.value)} defaultValue="" className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 text-sm">
                <option value="" disabled>Carregar vista…</option>
                {savedViews.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            )}
          </div>
          <button onClick={resetView} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Redefinir</button>
          <button onClick={openCreate} className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"><FiPlus className="inline mr-2"/>Novo projeto</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded border text-sm">Total: {kpis.total}</span>
        {Object.entries(kpis.byStatus).map(([s, n]) => (
          <span key={s} className="px-3 py-1 rounded text-sm border dark:border-gray-700">
            <StatusBadge s={s}/> <span className="ml-1">{n}</span>
          </span>
        ))}
      </div>

      {/* Presets rápidos */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">Presets:</span>
        <button onClick={presetEmAndamento} className="px-3 py-1 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Em andamento</button>
        <button onClick={presetConcluidos30d} className="px-3 py-1 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Concluídos 30d</button>
        <button onClick={presetAtrasados} className="px-3 py-1 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Atrasados</button>
        <button onClick={presetPlanejados} className="px-3 py-1 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Planejados</button>
      </div>

      {/* Toggle filtros em telas menores */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold">Filtros</h2>
        <button
          type="button"
          onClick={() => setShowFilters(v => !v)}
          className="md:hidden px-3 py-1.5 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >{showFilters ? 'Ocultar' : 'Mostrar'}</button>
      </div>

      <div className={`${showFilters ? 'grid' : 'hidden md:grid'} grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4`}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            className="w-full min-w-0 pl-10 pr-3 py-2 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
            placeholder="Buscar por nome ou descrição..."
          />
        </div>
        <div className="relative">
          <button onClick={() => setStatusOpen(s => !s)} className="w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <span className="flex items-center gap-2"><FiFilter/> Status</span>
            {statusOpen ? <FiChevronUp/> : <FiChevronDown/>}
          </button>
          {statusOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-2 max-h-60 overflow-auto shadow-lg">
              {statuses.length === 0 && <div className="text-sm text-gray-500">Sem status encontrados</div>}
              {statuses.map(s => (
                <label key={s} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input type="checkbox" checked={statusFilter.includes(s)} onChange={e => {
                    setStatusFilter(prev => e.target.checked ? [...prev, s] : prev.filter(x => x !== s));
                    setPage(1);
                  }}/>
                  <span>{s}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"/>
          <span className="text-sm text-gray-500">até</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"/>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="dataInicio">Ordenar por: Início</option>
            <option value="dataFim">Ordenar por: Fim</option>
            <option value="nome">Ordenar por: Nome</option>
            <option value="status">Ordenar por: Status</option>
          </select>
          <select value={sortDir} onChange={e => setSortDir(e.target.value)} className="px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setColOpen(o => !o)} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Colunas</button>
          {colOpen && (
            <div className="relative">
              <div className="absolute z-10 mt-1 w-64 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 p-2">
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input type="checkbox" checked={col.visible} onChange={e => setColumns(prev => prev.map(c => c.key === col.key ? { ...c, visible: e.target.checked } : c))}/>
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="relative">
            <button onClick={() => setBulkOpen(b => !b)} className={`px-3 py-2 rounded text-sm border flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700`}><FiCopy/> Ações em massa</button>
            {bulkOpen && (
              <div className="absolute z-10 mt-1 w-72 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 p-2">
                <div className="text-xs text-gray-500 mb-2">Selecionados: {selected.size}</div>
                <div className="flex items-center gap-2 mb-2">
                  <input value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} placeholder="Novo status" className="flex-1 px-2 py-1 rounded border bg-white dark:bg-gray-800 dark:border-gray-700"/>
                  <button onClick={handleBulkStatusUpdate} disabled={!selected.size} className={`px-3 py-1 rounded text-xs ${selected.size ? 'bg-amber-600 text-white hover:bg-amber-700' : 'border text-gray-400'}`}>Atualizar status</button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="date" value={bulkInicio} onChange={e => setBulkInicio(e.target.value)} className="px-2 py-1 rounded border bg-white dark:bg-gray-800 dark:border-gray-700"/>
                  <input type="date" value={bulkFim} onChange={e => setBulkFim(e.target.value)} className="px-2 py-1 rounded border bg-white dark:bg-gray-800 dark:border-gray-700"/>
                  <button onClick={handleBulkDatesUpdate} disabled={!selected.size} className={`col-span-2 px-3 py-1 rounded text-xs ${selected.size ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border text-gray-400'}`}>Atualizar datas</button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => handleBulkExportSelected('csv')} className="px-3 py-1 rounded border text-xs hover:bg-gray-50 dark:hover:bg-gray-700"><FiDownload/> Exportar CSV</button>
                  <button onClick={() => handleBulkExportSelected('json')} className="px-3 py-1 rounded border text-xs hover:bg-gray-50 dark:hover:bg-gray-700"><FiDownload/> Exportar JSON</button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleBulkDuplicate} disabled={!selected.size} className={`px-3 py-1 rounded text-xs ${selected.size ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border text-gray-400'}`}>Duplicar</button>
                  <button onClick={handleBulkDelete} disabled={!selected.size} className={`px-3 py-1 rounded text-xs ${selected.size ? 'bg-red-600 text-white hover:bg-red-700' : 'border text-gray-400'}`}><FiTrash2/> Excluir</button>
                </div>
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={dense} onChange={e => { setDense(e.target.checked); persistDefaultView(); }} />
            Denso
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={groupByStatus} onChange={e => { setGroupByStatus(e.target.checked); setPage(1); persistDefaultView(); }} />
            Agrupar por status
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useVirtual} onChange={e => setUseVirtual(e.target.checked)} disabled={groupByStatus} />
            Virtualizar (desativa paginação)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Linhas por página</span>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" disabled={useVirtual}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <div className="hidden md:flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-500">Altura virtual (px)</span>
            <input
              type="number"
              min={240}
              max={1000}
              step={24}
              value={virtualHeight}
              disabled={!useVirtual}
              onChange={e => setVirtualHeight(Math.max(240, Math.min(1000, parseInt(e.target.value || '0', 10))))}
              className="w-24 px-2 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700"
            />
            <button
              type="button"
              disabled={!useVirtual}
              onClick={() => setVirtualHeight(480)}
              className="px-3 py-2 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >Reset</button>
            {useVirtual && (
              <span className="text-xs text-gray-500">Visíveis aprox: {approxVisible}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabela ou grupos */}
      {!groupByStatus && !useVirtual && (
        <div className="overflow-auto border rounded dark:border-gray-700">
          <table className={`min-w-full text-sm ${dense ? 'table-fixed' : ''}`}>
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className={`p-3 w-10 ${dense ? 'py-2' : ''}`}><input type="checkbox" onChange={toggleAllVisible} checked={pageRows.length > 0 && pageRows.every(r => selected.has(r.id))}/></th>
                {visibleColumns.map((col, idx) => (
                  <th
                    key={col.key}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => {
                      if (dragIdx === null || dragIdx === idx) return;
                      setColumns(prev => {
                        const arr = [...prev];
                        const only = arr.filter(c => visibleColumns.some(v => v.key === c.key));
                        // find original index in arr by key order
                        const orderKeys = visibleColumns.map(v => v.key);
                        const mapIndex = k => arr.findIndex(c => c.key === k);
                        const a = mapIndex(orderKeys[dragIdx]);
                        const b = mapIndex(orderKeys[idx]);
                        const tmp = arr[a]; arr[a] = arr[b]; arr[b] = tmp;
                        return arr;
                      });
                      setDragIdx(null);
                    }}
                    onClick={() => { if (sortBy === col.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else setSortBy(col.key); }}
                    className={`p-3 text-left font-semibold cursor-pointer select-none ${dense ? 'py-2' : ''}`}
                    title="Clique para ordenar"
                  >
                    <span className="inline-flex items-center gap-2">
                      {col.label}
                      {sortBy === col.key && <span className="text-xs text-gray-500">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                    </span>
                  </th>
                ))}
                <th className={`p-3 text-right ${dense ? 'py-2' : ''}`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={visibleColumns.length + 2} className="p-6 text-center">Carregando...</td></tr>
              )}
              {!loading && pageRows.length === 0 && (
                <tr><td colSpan={visibleColumns.length + 2} className="p-6 text-center text-gray-500">Nenhum projeto encontrado</td></tr>
              )}
              {!loading && pageRows.map((row, idx) => (
                <tr key={row.id} className={`border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-900/60'}`} onClick={e => { if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') setDetail(row); }}>
                  <td className={`p-3 ${dense ? 'py-2' : ''}`}><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} /></td>
                  {visibleColumns.map(col => (
                    <td key={col.key} className={`p-3 ${dense ? 'py-2' : ''}`}>
                      {col.render ? col.render(row) : col.accessor ? col.accessor(row) : ''}
                    </td>
                  ))}
                  <td className={`p-3 text-right ${dense ? 'py-2' : ''}`}>
                    <button onClick={() => openEdit(row)} className="px-2 py-1 rounded border text-xs hover:bg-gray-50 dark:hover:bg-gray-700 mr-2"><FiEdit className="inline"/> Editar</button>
                    <button onClick={() => setDetail(row)} className="px-2 py-1 rounded border text-xs hover:bg-gray-50 dark:hover:bg-gray-700"><FiInfo className="inline"/> Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Virtualized list */}
      {!groupByStatus && useVirtual && (
        <div className="border rounded dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 px-2 py-2 text-sm text-gray-600 dark:text-gray-300">Virtualização ativa. Paginação desativada.</div>
          {/* Header as grid */}
          <div className="overflow-hidden">
            <div
              className="grid border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-semibold"
              style={{ gridTemplateColumns: `48px repeat(${visibleColumns.length}, minmax(150px, 1fr)) 160px` }}
            >
              <div className="p-3"><input type="checkbox" onChange={() => {
                const ids = filtered.map(r => r.id);
                const allSelected = ids.every(id => selected.has(id));
                const next = new Set(selected);
                ids.forEach(id => { if (allSelected) next.delete(id); else next.add(id); });
                setSelected(next);
              }} checked={filtered.length > 0 && filtered.every(r => selected.has(r.id))} /></div>
              {visibleColumns.map((col, idx) => (
                <div key={col.key}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => {
                    if (dragIdx === null || dragIdx === idx) return;
                    setColumns(prev => {
                      const arr = [...prev];
                      const orderKeys = visibleColumns.map(v => v.key);
                      const mapIndex = k => arr.findIndex(c => c.key === k);
                      const a = mapIndex(orderKeys[dragIdx]);
                      const b = mapIndex(orderKeys[idx]);
                      const tmp = arr[a]; arr[a] = arr[b]; arr[b] = tmp;
                      return arr;
                    });
                    setDragIdx(null);
                  }}
                  className="p-3 cursor-grab select-none"
                  onClick={() => { if (sortBy === col.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else setSortBy(col.key); }}
                  title="Clique para ordenar ou arraste para reordenar"
                >
                  <span className="inline-flex items-center gap-2">
                    {col.label}
                    {sortBy === col.key && <span className="text-xs text-gray-500">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </span>
                </div>
              ))}
              <div className="p-3 text-right">Ações</div>
            </div>
          </div>
          <Suspense fallback={<div style={{ height: virtualHeight }} className="overflow-auto p-3 text-sm text-gray-500">Carregando virtualização…</div>}>
            <div style={{ height: virtualHeight }} className="overflow-auto">
              <List
                height={virtualHeight}
                itemCount={filtered.length}
                itemSize={dense ? 36 : 48}
                width={'100%'}
              >
                {({ index, style }) => {
                  const row = filtered[index];
                  const idx = index;
                  return (
                    <div key={row?.id || index} className={`grid border-b dark:border-gray-700 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-900/60'}`}
                      style={{ ...style, display: 'grid', gridTemplateColumns: `48px repeat(${visibleColumns.length}, minmax(150px, 1fr)) 160px` }}
                    >
                      <div className="p-2 flex items-center"><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} /></div>
                      {visibleColumns.map(col => (
                        <div key={col.key} className="p-2 flex items-center">
                          {col.render ? col.render(row) : col.accessor ? col.accessor(row) : ''}
                        </div>
                      ))}
                      <div className="p-2 flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(row)} className="px-2 py-1 rounded border text-xs hover:bg-gray-50 dark:hover:bg-gray-700"><FiEdit className="inline"/> Editar</button>
                        <button onClick={() => setDetail(row)} className="px-2 py-1 rounded border text-xs hover:bg-gray-50 dark:hover:bg-gray-700"><FiInfo className="inline"/> Detalhes</button>
                      </div>
                    </div>
                  );
                }}
              </List>
            </div>
          </Suspense>
        </div>
      )}

      {groupByStatus && (
        <div className="space-y-4">
          {Object.keys(kpis.byStatus).map((s) => {
            const rows = filtered.filter(r => (r.status || '—') === s);
            return (
              <div key={s} className="border rounded dark:border-gray-700">
                <div className="px-4 py-2 border-b dark:border-gray-700 flex items-center gap-2"><StatusBadge s={s}/> <span className="text-sm text-gray-500">{rows.length}</span></div>
                <div className="overflow-auto">
                  <table className={`min-w-full text-sm ${dense ? 'table-fixed' : ''}`}>
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                      <tr>
                        <th className={`p-3 w-10 ${dense ? 'py-2' : ''}`}></th>
                        {visibleColumns.map(col => (
                          <th key={col.key} className={`p-3 text-left font-semibold ${dense ? 'py-2' : ''}`}>{col.label}</th>
                        ))}
                        <th className={`p-3 text-right ${dense ? 'py-2' : ''}`}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={row.id} className={`border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-900/60'}`}>
                          <td className={`p-3 ${dense ? 'py-2' : ''}`}><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} /></td>
                          {visibleColumns.map(col => (
                            <td key={col.key} className={`p-3 ${dense ? 'py-2' : ''}`}>
                              {col.render ? col.render(row) : col.accessor ? col.accessor(row) : ''}
                            </td>
                          ))}
                          <td className={`p-3 text-right ${dense ? 'py-2' : ''}`}>
                            <button onClick={() => openEdit(row)} className="px-2 py-1 rounded border text-xs hover:bg-gray-50 dark:hover:bg-gray-700 mr-2"><FiEdit className="inline"/> Editar</button>
                            <button onClick={() => setDetail(row)} className="px-2 py-1 rounded border text-xs hover:bg-gray-50 dark:hover:bg-gray-700"><FiInfo className="inline"/> Detalhes</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-500">{filtered.length} registro(s)</div>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(1)} className="px-3 py-1 rounded border text-sm disabled:opacity-50">«</button>
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border text-sm disabled:opacity-50">‹</button>
          <span className="text-sm">Página {page} de {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border text-sm disabled:opacity-50">›</button>
          <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1 rounded border text-sm disabled:opacity-50">»</button>
        </div>
      </div>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <ProjetoForm
            initial={editing ? {
              nome: editing.nome || '',
              descricao: editing.descricao || '',
              status: editing.status || '',
              dataInicio: editing.dataInicio ? formatDate(editing.dataInicio) : '',
              dataFim: editing.dataFim ? formatDate(editing.dataFim) : '',
            } : { nome: '', descricao: '', status: '', dataInicio: '', dataFim: '' }}
            onCancel={() => setModalOpen(false)}
            onSave={handleSave}
            title={editing ? 'Editar projeto' : 'Novo projeto'}
          />
        </Modal>
      )}

      {detail && (
        <SidePanel onClose={() => setDetail(null)}>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{detail.nome}</h3>
            <div className="text-sm text-gray-500">ID: {detail.id ?? '—'}</div>
            <div><StatusBadge s={detail.status}/></div>
            <div className="text-sm"><span className="text-gray-500">Início:</span> {detail.dataInicio ? formatDate(detail.dataInicio) : '—'}</div>
            <div className="text-sm"><span className="text-gray-500">Fim:</span> {detail.dataFim ? formatDate(detail.dataFim) : '—'}</div>
            <div className="text-sm"><span className="text-gray-500">Time:</span> {detail.timeResponsavel || detail.time || '—'}</div>
            <div className="text-sm"><span className="text-gray-500">Descrição:</span> <div className="mt-1 whitespace-pre-wrap">{detail.descricao || '—'}</div></div>

            <div className="pt-2">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><FiUser/> Usuários {detailUsers.fallback ? '(todos - fallback)' : 'do time responsável'}</h4>
              {detailUsers.loading && <div className="text-sm text-gray-500">Carregando usuários…</div>}
              {detailUsers.error && !detailUsers.loading && (
                <div className="text-sm text-red-500">{detailUsers.error}</div>
              )}
              {!detailUsers.loading && !detailUsers.error && (
                detailUsers.rows.length ? (
                  <ul className="space-y-2">
                    {detailUsers.rows.map(u => (
                      <li key={u.id} className="p-2 rounded border dark:border-gray-700 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{u.nome || u.name || '—'}</div>
                          <div className="text-xs text-gray-500">{u.email || '—'}</div>
                        </div>
                        <div className="text-right">
                          {u.cargo && <span className="inline-block text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{u.cargo}</span>}
                          <div className="text-xs mt-1 text-gray-500">{u.ativo === false ? 'Inativo' : 'Ativo'}{u.oauth ? ' • OAuth' : ''}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">Nenhum usuário encontrado para este projeto.</div>
                )
              )}
            </div>
            <ProjetoTasksCount id={detail.id} />
            <ProjetoMilestones projetoId={detail.id} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDetail(null)} className="px-3 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-700">Fechar</button>
              <button onClick={() => { setEditing(detail); setModalOpen(true); }} className="px-3 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-700"><FiEdit className="inline"/> Editar</button>
            </div>
          </div>
        </SidePanel>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-30 bg-white dark:bg-gray-800 rounded shadow-xl w-full max-w-xl">
        <button className="absolute right-3 top-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}><FiX/></button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function SidePanel({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-30 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-xl relative">
        <button className="absolute right-3 top-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}><FiX/></button>
        <div className="p-6 h-full overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function ProjetoForm({ initial, onSave, onCancel, title }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    console.log('[ProjetoForm] submit chamado, form atual:', form);
    if (!form.nome?.trim()) { 
      console.error('[ProjetoForm] Nome vazio, abortando');
      toast.error('Informe o nome'); 
      return; 
    }
    try {
      setSaving(true);
      let timesIds = [];
      const nomeTime = (form.timeResponsavel || '').trim();
      if (nomeTime) {
        try {
          const t = await timeService.criar(nomeTime);
          if (t && t.id) timesIds = [t.id];
        } catch (err) {
          console.error('[ProjetoForm] Erro ao criar time:', err);
          // Continua sem time se houver erro
        }
      }
      const payload = {
        nome: form.nome?.trim(),
        descricao: form.descricao?.trim() || '',
        status: form.status?.trim() || 'NOVO',
        timesResponsaveisIds: timesIds,
        dataInicio: form.dataInicio || null,
        dataFim: form.dataFim || null,
      };
      console.log('[ProjetoForm] Enviando payload:', payload);
      await onSave(payload);
    } catch (err) {
      console.error('[ProjetoForm] Erro ao salvar projeto:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Erro ao salvar projeto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div>
        <label className="block text-sm mb-1">Nome</label>
        <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" value={form.nome} onChange={e => update('nome', e.target.value)} placeholder="Nome do projeto" />
      </div>
      <div>
        <label className="block text-sm mb-1">Descrição</label>
        <textarea className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" rows={3} value={form.descricao} onChange={e => update('descricao', e.target.value)} placeholder="Descrição" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Status</label>
          <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" value={form.status} onChange={e => update('status', e.target.value)} placeholder="Ex: Em andamento" />
        </div>
        <div>
          <label className="block text-sm mb-1">Time responsável</label>
          <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" value={form.timeResponsavel || ''} onChange={e => update('timeResponsavel', e.target.value)} placeholder="Ex: TI" />
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
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
        <button 
          type="submit" 
          disabled={saving} 
          onClick={() => console.log('[ProjetoForm] Botão Salvar clicado')}
          className={`px-4 py-2 rounded text-white ${saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

function ProjetoTasksCount({ id }) {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const n = await projetoService.contarTarefasDoProjeto(id);
        if (!active) return;
        setCount(typeof n === 'number' ? n : (n?.quantidade ?? null));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);
  return (
    <div className="text-sm text-gray-600 dark:text-gray-300">
      {loading ? 'Carregando tarefas…' : (`Tarefas vinculadas: ${count ?? '—'}`)}
    </div>
  );
}

function ProjetoMilestones({ projetoId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ titulo: '', data: '', responsavelNome: '', lembreteDiasAntes: '' });

  useEffect(() => { load(); }, [projetoId]);

  async function load() {
    try {
      setLoading(true);
      const data = await marcoService.listar(projetoId);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function add(e) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.data) { toast.error('Preencha título e data'); return; }
    await marcoService.criar(projetoId, form);
    setForm({ titulo: '', data: '', responsavelNome: '', lembreteDiasAntes: '' });
    load();
  }

  async function remove(id) {
    await marcoService.remover(id);
    load();
  }

  return (
    <div className="pt-2">
      <h4 className="text-sm font-semibold mb-2">Marcos do projeto</h4>
      {loading && <div className="text-sm text-gray-500">Carregando…</div>}
      {!loading && (
        <ul className="space-y-2 mb-3">
          {rows.map(m => (
            <li key={m.id} className="p-2 rounded border dark:border-gray-700 flex items-center justify-between">
              <div>
                <div className="font-medium">{m.titulo}</div>
                <div className="text-xs text-gray-500">{new Date(m.data).toLocaleDateString()} {m.responsavelNome ? `• Resp.: ${m.responsavelNome}` : ''} {m.lembreteDiasAntes != null ? `• Lembrete: ${m.lembreteDiasAntes}d antes` : ''}</div>
              </div>
              <button onClick={() => remove(m.id)} className="px-2 py-1 rounded border text-xs hover:bg-gray-50 dark:hover:bg-gray-700">Excluir</button>
            </li>
          ))}
          {rows.length === 0 && <li className="text-sm text-gray-500">Nenhum marco cadastrado.</li>}
        </ul>
      )}
      <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <input className="md:col-span-2 px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" placeholder="Título" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
        <input type="date" className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
        <input className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" placeholder="Responsável (op.)" value={form.responsavelNome} onChange={e => setForm({ ...form, responsavelNome: e.target.value })} />
        <input type="number" min="0" className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" placeholder="Lembrete (dias)" value={form.lembreteDiasAntes} onChange={e => setForm({ ...form, lembreteDiasAntes: e.target.value })} />
        <div className="md:col-span-5">
          <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Adicionar marco</button>
        </div>
      </form>
    </div>
  );
}
