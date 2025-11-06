import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/backendApi';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ao montar, se houver token salvo, restaura o usuário do localStorage (backend não expõe /perfil)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const raw = localStorage.getItem('user');
      if (raw) {
        const userData = JSON.parse(raw);
        setUser(userData);
        // eslint-disable-next-line no-console
        console.log('[AuthContext] User restored from localStorage:', userData);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[AuthContext] Failed to restore user:', err);
      // se corrompido, limpa
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, senha) => {
    try {
      setLoading(true);
      setError(null);
      const maybeUser = await authService.login(email, senha);
      
      // eslint-disable-next-line no-console
      console.log('[AuthContext] Login returned user:', maybeUser);
      
      if (!maybeUser) {
        // eslint-disable-next-line no-console
        console.error('[AuthContext] No user returned from login!');
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user');
        throw new Error('Credenciais inválidas');
      }
      
      setUser(maybeUser);
      // eslint-disable-next-line no-console
      console.log('[AuthContext] User state updated:', maybeUser);
      return maybeUser;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[AuthContext] Login error:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, senha, nome, cargo, time) => {
    try {
      setLoading(true);
      setError(null);
      const maybeUser = await authService.register({ nome, email, senha, cargo, time });
      setUser(maybeUser);
      return maybeUser;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
