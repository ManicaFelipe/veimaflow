
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMoon, FiSun, FiBell, FiLogOut, FiHome } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import logoMark from '../assets/branding/logo-mark.svg';

export default function Navbar({ dark, setDark, onLogout }) {
  const { user } = useAuth();
  return (
    <nav className="shadow p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoMark} alt="VemaFlow" className="h-7 w-7" />
          <span className="font-bold text-lg text-gray-800 dark:text-gray-100 tracking-tight">VEIMANFLOW</span>
        </Link>
        <div className="flex items-center gap-4">
          {!user && (
            <>
              <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400">Entrar</Link>
              <Link to="/register" className="text-sm text-green-600 dark:text-green-400">Cadastrar</Link>
            </>
          )}
          {user && (
            <>
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <FiHome /> Início
              </Link>
              <button
                className="ml-2 p-2 rounded transition-colors text-gray-500 hover:bg-gray-200 dark:text-blue-400 dark:hover:bg-gray-800"
                title="Notificações"
              >
                <FiBell size={20} />
              </button>
              <button
                onClick={onLogout}
                className="ml-2 p-2 rounded transition-colors text-red-500 hover:bg-gray-200 dark:text-red-400 dark:hover:bg-gray-800"
                title="Sair"
              >
                <FiLogOut size={20} />
              </button>
            </>
          )}
          <button
            onClick={() => setDark(!dark)}
            className="ml-2 p-2 rounded transition-colors text-gray-500 hover:bg-gray-200 dark:text-yellow-400 dark:hover:bg-gray-800"
            title={dark ? 'Modo claro' : 'Modo escuro'}
          >
            {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
