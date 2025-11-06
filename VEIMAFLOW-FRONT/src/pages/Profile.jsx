import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ nome: '', email: '', cargo: '', time: '', ativo: true, oauth: false });
  const [loading, setLoading] = useState(false);
  const [saving] = useState(false);

  useEffect(() => {
    // Usa o usuário do contexto de auth (veio do login) ao invés de fazer chamada à API
    if (user) {
      setForm({
        nome: user.nome || user.name || '',
        email: user.email || '',
        cargo: user.cargo || '',
        time: user.time || user.timeResponsavel || '',
        ativo: user.ativo !== false,
        oauth: !!user.oauth,
      });
    } else {
      // Sem user no contexto e backend não expõe /perfil
      setLoading(false);
    }
  }, [user]);

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    toast.info('Edição de perfil não disponível no backend atual.');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Perfil</h1>
      {loading ? (
        <div className="text-gray-500">Carregando…</div>
      ) : (
        <form onSubmit={submit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm mb-1">Nome</label>
            <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-700" value={form.nome} onChange={e => update('nome', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full px-3 py-2 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-700" value={form.email} readOnly />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Cargo</label>
              <input className="w-full px-3 py-2 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-700" value={form.cargo} readOnly />
            </div>
            <div>
              <label className="block text-sm mb-1">Time</label>
              <input className="w-full px-3 py-2 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-700" value={form.time} readOnly />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.ativo} readOnly /> Ativo</label>
            <span className="text-sm text-gray-500">OAuth: {form.oauth ? 'Sim' : 'Não'}</span>
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" className={`px-4 py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed`} title="Edição indisponível">Salvar alterações</button>
          </div>
        </form>
      )}
    </div>
  );
}
