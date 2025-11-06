import axios from 'axios';
import { toast } from 'react-toastify';

// Em desenvolvimento, usamos o proxy do Vite em /api para evitar CORS.
// Em produção, usamos a VITE_API_URL vinda do .env (sem barra final).
const envBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const baseURL = import.meta.env.DEV ? '/api' : (envBase || 'http://localhost:8080');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const tipo = localStorage.getItem('token_type') || 'Bearer';
    if (token) {
      config.headers.Authorization = `${tipo} ${token}`.trim();
      // eslint-disable-next-line no-console
      console.log('[API AUTH]', config.method?.toUpperCase(), config.url, '| Token:', token.substring(0, 20) + '...', '| Type:', tipo);
    } else {
      // eslint-disable-next-line no-console
      console.warn('[API AUTH]', config.method?.toUpperCase(), config.url, '| No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detalhado no console para facilitar debug de 4xx/5xx
    if (error.response) {
      // eslint-disable-next-line no-console
      console.error('[API ERROR]', error.config?.method?.toUpperCase(), error.config?.url, error.response.status, error.response.data);
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      // eslint-disable-next-line no-console
      console.error('[API ERROR] BACKEND OFFLINE - Não foi possível conectar ao servidor em:', baseURL);
      toast.error('🔴 Backend offline! Verifique se o servidor está rodando.');
    } else {
      // eslint-disable-next-line no-console
      console.error('[API ERROR]', error.message);
    }
    let message = error.response?.data?.message || error.message || 'Ocorreu um erro na requisição';
    const status = error.response?.status;
    
    // 401 ou 403 em rotas protegidas = token inválido/expirado ou sem permissão
  if (status === 401 || status === 403) {
      // Normaliza mensagens de credenciais inválidas
      if (/senha inválida|credencial/i.test(message)) {
        message = 'Credenciais inválidas';
      } else if (status === 403) {
        message = 'Acesso negado. Faça login novamente.';
      } else {
        message = 'Sessão expirada. Faça login novamente.';
      }
      
      // Limpa token e redireciona para login
  localStorage.removeItem('token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('user');
      
      // Evita loop infinito de redirecionamento se já estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        toast.error(message);
        window.location.href = '/login';
      }
    } else {
      // Não mostra toast para endpoints opcionais que não existem no backend (500 "No static resource")
      const isOptionalEndpoint = status === 500 && /No static resource/i.test(message);
      if (!isOptionalEndpoint) {
        toast.error(message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Serviços de gestão de projetos
export const projetoService = {
  async listarProjetos() {
    const response = await api.get('/projetos');
    return response.data;
  },

  async buscarProjetoPorId(id) {
    const response = await api.get(`/projetos/${id}`);
    return response.data;
  },

  async criarProjeto(projeto) {
    const response = await api.post('/projetos', projeto);
    toast.success('Projeto criado com sucesso!');
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('projetos:changed', { detail: { action: 'create', projeto: response.data } }));
      }
    } catch {}
    return response.data;
  },

  async atualizarProjeto(id, projeto) {
    const response = await api.put(`/projetos/${id}`, projeto);
    toast.success('Projeto atualizado com sucesso!');
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('projetos:changed', { detail: { action: 'update', projeto: response.data } }));
      }
    } catch {}
    return response.data;
  },

  async removerProjeto(id) {
    await api.delete(`/projetos/${id}`);
    toast.success('Projeto removido com sucesso!');
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('projetos:changed', { detail: { action: 'delete', id } }));
      }
    } catch {}
  },

  async listarProjetosPorStatus(status) {
    const response = await api.get(`/projetos/status/${status}`);
    return response.data;
  },

  async listarUsuariosDoProjeto(id) {
    const response = await api.get(`/projetos/${id}/usuarios`);
    return response.data;
  },

  async contarTarefasDoProjeto(id) {
    const response = await api.get(`/projetos/${id}/tarefas/quantidade`);
    return response.data;
  },
};

// Serviços de usuário (perfil)
export const usuarioService = {
  // Não suportado no backend atual: manter apenas utilitários existentes
  async obterPerfil() {
    return Promise.reject(new Error('Endpoint de perfil não disponível no backend atual'));
  },
  async atualizarPerfil() {
    return Promise.reject(new Error('Atualização de perfil não disponível no backend atual'));
  },
  async listar() {
    const response = await api.get('/usuarios');
    return response.data;
  },
  async criar({ nome, email, senha, cargo, time }) {
    const response = await api.post('/usuarios', { nome, email, senha, cargo, time });
    return response.data;
  },
};

// Serviços de times
export const timeService = {
  async criar(nome) {
    const response = await api.post('/times', { nome });
    return response.data;
  },
  async listar() {
    return Promise.reject(new Error('Listagem de times não disponível no backend atual'));
  },
  async buscarPorId(id) {
    return Promise.reject(new Error('Busca de time não disponível no backend atual'));
  },
};

// Serviços de dashboard
export const dashboardService = {
  async obterMetricas(projetoId = null) {
    const params = projetoId ? `?projetoId=${projetoId}` : '';
    const response = await api.get(`/dashboard/metrics${params}`);
    return response.data;
  },
  async obterExecutivo() {
    const response = await api.get('/dashboard/executivo');
    return response.data;
  }
};

// Serviço de SLA
export const slaService = {
  async obterSlaTarefa(tarefaId) {
    const response = await api.get(`/tarefas/${tarefaId}/sla`);
    return response.data;
  },
};

// Serviço de anexos
export const anexoService = {
  async listar(tarefaId) {
    const resp = await api.get(`/tarefas/${tarefaId}/anexos`);
    return resp.data;
  },
  async upload(tarefaId, file) {
    const form = new FormData();
    form.append('file', file);
    const resp = await api.post(`/tarefas/${tarefaId}/anexos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data;
  },
  async download(anexoId) {
    const resp = await api.get(`/anexos/${anexoId}/download`, { responseType: 'blob' });
    return resp;
  },
  async remover(anexoId) {
    await api.delete(`/anexos/${anexoId}`);
  }
};

// Serviços de gestão de tarefas
export const tarefaService = {
  async listarTarefas() {
    const response = await api.get('/tarefas');
    return response.data;
  },

  async buscarTarefaPorId(id) {
    const response = await api.get(`/tarefas/${id}`);
    return response.data;
  },

  async criarTarefa(tarefa) {
    // Normaliza payload para o backend: nome->titulo, status enum válido, projetoId numérico
    const norm = normalizeTaskPayload(tarefa);
    const response = await api.post('/tarefas', norm);
    toast.success('Tarefa criada com sucesso!');
    return response.data;
  },

  async atualizarTarefa(id, tarefa) {
    const norm = normalizeTaskPayload(tarefa);
    const response = await api.put(`/tarefas/${id}`, norm);
    toast.success('Tarefa atualizada com sucesso!');
    return response.data;
  },

  async atualizarStatusTarefa(id, status) {
    const response = await api.patch(`/tarefas/${id}/status`, { status });
    toast.success('Status da tarefa atualizado com sucesso!');
    return response.data;
  },

  async removerTarefa(id) {
    await api.delete(`/tarefas/${id}`);
    toast.success('Tarefa removida com sucesso!');
  },

  async listarTarefasPorStatus(status) {
    const response = await api.get(`/tarefas/status/${status}`);
    return response.data;
  },

  async listarPorUsuario(usuarioId) {
    const response = await api.get(`/tarefas/usuario/${usuarioId}`);
    return response.data;
  },
};

// Serviços de comentários em tarefas
export const comentarioService = {
  async listar(tarefaId) {
    const resp = await api.get(`/tarefas/${tarefaId}/comentarios`);
    return resp.data;
  },
  async criar(tarefaId, { conteudo, autorNome }) {
    const payload = { conteudo: (conteudo || '').trim(), autorNome: (autorNome || '').trim() || undefined };
    const resp = await api.post(`/tarefas/${tarefaId}/comentarios`, payload);
    return resp.data;
  }
};

// Serviços de marcos do projeto
export const marcoService = {
  async listar(projetoId) {
    const resp = await api.get(`/projetos/${projetoId}/marcos`);
    return resp.data;
  },
  async criar(projetoId, data) {
    const payload = {
      titulo: (data.titulo || '').trim(),
      data: data.data,
      responsavelNome: data.responsavelNome || undefined,
      lembreteDiasAntes: data.lembreteDiasAntes != null ? Number(data.lembreteDiasAntes) : undefined,
    };
    const resp = await api.post(`/projetos/${projetoId}/marcos`, payload);
    return resp.data;
  },
  async atualizar(id, data) {
    const payload = {
      titulo: (data.titulo || '').trim(),
      data: data.data,
      responsavelNome: data.responsavelNome || undefined,
      lembreteDiasAntes: data.lembreteDiasAntes != null ? Number(data.lembreteDiasAntes) : undefined,
    };
    const resp = await api.put(`/marcos/${id}`, payload);
    return resp.data;
  },
  async remover(id) {
    await api.delete(`/marcos/${id}`);
  }
};

// Serviços de subtarefas
export const subtarefaService = {
  async listar(tarefaId) {
    const resp = await api.get(`/tarefas/${tarefaId}/subtarefas`);
    return resp.data;
  },
  async criar(tarefaId, data) {
    const payload = {
      titulo: (data.titulo || '').trim(),
      status: toEnumStatus(data.status) || undefined,
      ordem: data.ordem != null ? Number(data.ordem) : undefined,
    };
    const resp = await api.post(`/tarefas/${tarefaId}/subtarefas`, payload);
    return resp.data;
  },
  async atualizar(id, data) {
    const payload = {
      titulo: (data.titulo || '').trim(),
      status: toEnumStatus(data.status) || undefined,
      ordem: data.ordem != null ? Number(data.ordem) : undefined,
    };
    const resp = await api.put(`/subtarefas/${id}`, payload);
    return resp.data;
  },
  async remover(id) {
    await api.delete(`/subtarefas/${id}`);
  },
};

// Serviços de dependências entre tarefas
export const dependenciaService = {
  async listar(tarefaId) {
    const resp = await api.get(`/tarefas/${tarefaId}/dependencias`);
    return resp.data; // { bloqueia: number[], bloqueadoPor: number[] }
  },
  async adicionar(tarefaId, dependeDeId) {
    await api.post(`/tarefas/${tarefaId}/dependencias`, null, { params: { dependeDeId } });
  },
  async remover(tarefaId, dependeDeId) {
    await api.delete(`/tarefas/${tarefaId}/dependencias`, { params: { dependeDeId } });
  },
};

// Helpers
const TASK_STATUS = ['NAO_INICIADO','EM_ANDAMENTO','CONCLUIDA','CANCELADA'];
function toEnumStatus(s) {
  if (!s) return undefined;
  const up = String(s).trim().toUpperCase();
  if (TASK_STATUS.includes(up)) return up;
  // heurística simples p/ rótulos em PT
  const k = up.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (k.includes('ANDAMENT')) return 'EM_ANDAMENTO';
  if (k.includes('CONCLU')) return 'CONCLUIDA';
  if (k.includes('CANCEL')) return 'CANCELADA';
  if (k.includes('NAO') || k.includes('NÃO') || k.includes('INICIADO')) return 'NAO_INICIADO';
  return undefined;
}

function normalizeTaskPayload(src = {}) {
  const payload = {
    titulo: (src.titulo || src.nome || '').trim() || undefined,
    descricao: (src.descricao || '').trim(),
    projetoId: src.projetoId != null && src.projetoId !== '' ? Number(src.projetoId) : undefined,
    prioridade: src.prioridade || undefined,
    status: toEnumStatus(src.status),
    usuarioId: src.usuarioId,
    nomeUsuario: src.nomeUsuario,
    timeUsuario: src.timeUsuario,
  };
  // remove undefined para não quebrar bind do backend
  Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
  return payload;
}

// Serviços de autenticação
export const authService = {
  async login(email, senha) {
    const response = await api.post('/auth/login', { email, senha });
    const data = response.data || {};
    
    // eslint-disable-next-line no-console
    console.log('[AUTH] Login response:', data);
    
    // Backend retorna accessToken (camelCase), não token
    const token = data.accessToken || data.token;
    const tipo = data.tokenType || data.tipo || 'Bearer';
    
    // eslint-disable-next-line no-console
    console.log('[AUTH] Token extracted:', token ? 'YES' : 'NO', '| Type:', tipo);
    
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('token_type', tipo);
      // eslint-disable-next-line no-console
      console.log('[AUTH] Token saved to localStorage');
    } else {
      // eslint-disable-next-line no-console
      console.error('[AUTH] No token in login response! Response data:', JSON.stringify(data));
    }
    
    // Backend retorna o usuário no login
    const user = data.usuario || data.user || null;
    // eslint-disable-next-line no-console
    console.log('[AUTH] User extracted:', user);
    
    if (user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        // eslint-disable-next-line no-console
        console.log('[AUTH] User saved to localStorage:', user);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[AUTH] Failed to save user:', err);
      }
    } else {
      // eslint-disable-next-line no-console
      console.error('[AUTH] No user in login response!');
    }
    return user;
  },

  async register({ nome, email, senha, cargo, time }) {
    const response = await api.post('/auth/register', { nome, email, senha, cargo, time });
    const data = response.data || {};
    // Backend retorna accessToken (camelCase), não token
    const token = data.accessToken || data.token;
    const tipo = data.tokenType || data.tipo || 'Bearer';
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('token_type', tipo);
    }
    // Pode retornar user/usuario
    const user = data.user || data.usuario || null;
    if (user) {
      try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
    }
    return user;
  },

  async buscarUsuarioAtual() {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
    toast.info('Logout realizado com sucesso!');
  }
};

// Função helper para debug de autenticação
export function debugAuth() {
  const token = localStorage.getItem('token');
  const tipo = localStorage.getItem('token_type');
  // eslint-disable-next-line no-console
  console.log('=== DEBUG AUTH ===');
  // eslint-disable-next-line no-console
  console.log('Token exists:', !!token);
  // eslint-disable-next-line no-console
  console.log('Token type:', tipo || 'Bearer (default)');
  if (token) {
    // eslint-disable-next-line no-console
    console.log('Token (first 30 chars):', token.substring(0, 30) + '...');
    // eslint-disable-next-line no-console
    console.log('Full Authorization header:', `${tipo || 'Bearer'} ${token}`);
  } else {
    // eslint-disable-next-line no-console
    console.log('No token found in localStorage');
  }
  // eslint-disable-next-line no-console
  console.log('==================');
}

// Exporta debugAuth para acesso via console: window.debugAuth()
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
}

export default api;