import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  // Enquanto estamos validando um token existente, evita redirecionar e mostra um pequeno loader
  if (loading && hasToken && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span
            className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
            aria-label="Carregando sessão"
          />
          <span>Carregando sessão…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  return <Outlet />;
}