

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUser, FiLayers, FiList, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// Definição de menu - todos os usuários autenticados podem ver
const menuItems = [
  { name: 'Dashboard', icon: <FiHome />, to: '/dashboard' },
  { name: 'Dashboard Executivo', icon: <FiHome />, to: '/dashboard-executivo' },
  { name: 'Projetos', icon: <FiLayers />, to: '/projetos' },
  { name: 'Tarefas', icon: <FiList />, to: '/tarefas' },
  { name: 'Perfil', icon: <FiUser />, to: '/profile' },
];

export default function Sidebar({ onLogout }) {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className={`h-screen transition-all duration-300 flex flex-col bg-white dark:bg-gray-900 border-r dark:border-gray-800 text-gray-800 dark:text-gray-100 ${open ? 'w-64' : 'w-16'} shadow-sm`}>
      <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 relative`} style={{height: '80px'}}>
        <span className={`font-bold text-lg transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>VemaFlow</span>
        <button
          onClick={() => setOpen(!open)}
          className={`p-1 rounded absolute right-2`}
          style={{top: '50%', transform: 'translateY(-50%)'}}
          title={open ? 'Retrair menu' : 'Expandir menu'}
        >
          <FiMenu size={24} />
        </button>
      </div>
      <nav className="flex-1 mt-4 relative">
        <ul className="space-y-2 px-2">
          {menuItems.map(item => (
            <li key={item.name}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap
                  hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-100
                  ${location.pathname === item.to ? 'bg-blue-100 dark:bg-gray-800 font-semibold text-blue-700 dark:text-blue-400' : ''}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0'} ${open ? '' : 'w-0'} overflow-hidden`}>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        {/* Removido botão duplicado de expandir/retrair */}
      </nav>
      <div className={`p-4 border-t border-gray-200 dark:border-gray-800`}>
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 px-4 py-2 w-full rounded-lg transition-colors duration-200 whitespace-nowrap text-gray-700 dark:text-gray-100 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400`}
        >
          <FiLogOut className="text-xl" />
          <span className={`transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0'} ${open ? '' : 'w-0'} overflow-hidden`}>Sair</span>
        </button>
      </div>
    </aside>
  );
}
