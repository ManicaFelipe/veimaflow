import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

// Layout usado apenas em rotas privadas: inclui Sidebar + área principal
export default function ProtectedLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar onLogout={logout} />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
