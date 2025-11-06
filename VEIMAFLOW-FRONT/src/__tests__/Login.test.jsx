import { render, screen, fireEvent } from '@testing-library/react';
import { AuthContext } from '../context/AuthContext';
import Login from '../pages/Login';

const mockLogin = jest.fn();

const renderLogin = () => {
  return render(
    <AuthContext.Provider value={{ login: mockLogin, error: null, loading: false }}>
      <Login />
    </AuthContext.Provider>
  );
};

describe('Login', () => {
  beforeEach(() => {
    mockLogin.mockClear();
  });

  it('renderiza formulário de login', () => {
    renderLogin();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
  });

  it('chama função de login com credenciais corretas', async () => {
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'teste@exemplo.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    fireEvent.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith('teste@exemplo.com', 'senha123');
  });
});