import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedLayout from './components/ProtectedLayout';
import BackendStatus from './components/BackendStatus';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/DashboardOperacional';
import DashboardExecutivo from './pages/DashboardExecutivo';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Projetos from './pages/Projetos';
import Tarefas from './pages/Tarefas';
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute';
import './index.css';

export default function App() {
  const { logout } = useAuth();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);
  useEffect(() => {
    console.log('[vemaflow] App mounted');
  }, []);
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Navbar dark={dark} setDark={setDark} onLogout={logout} />
        <BackendStatus />
        <Routes>
          {/* Public routes (sem Sidebar) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes (com Sidebar via ProtectedLayout) */}
          <Route element={<PrivateRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard-executivo" element={<DashboardExecutivo />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/tarefas" element={<Tarefas />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
