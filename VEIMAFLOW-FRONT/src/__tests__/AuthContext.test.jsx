import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authService } from '../services/backendApi';

jest.mock('../services/backendApi', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    buscarUsuarioAtual: jest.fn(),
    logout: jest.fn(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user');
    }),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('inicia com estado inicial correto', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('login bem sucedido atualiza o estado', async () => {
    const mockUser = { id: 1, name: 'Teste' };
    const mockToken = 'token-123';
    authService.login.mockImplementationOnce(async () => {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('token_type', 'Bearer');
      localStorage.setItem('user', JSON.stringify(mockUser));
      return mockUser;
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('teste@exemplo.com', 'senha123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  it('logout limpa o estado', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    localStorage.setItem('token', 'token-123');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});