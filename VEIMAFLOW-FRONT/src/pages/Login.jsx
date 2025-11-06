import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  senha: Yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
});

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const formik = useFormik({
  initialValues: { email: '', senha: '', remember: false },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        await login(values.email, values.senha);
        toast.success('Login realizado com sucesso!');
        const dest = location.state?.from?.pathname || '/dashboard';
        navigate(dest, { replace: true });
      } catch (error) {
        const msg = error?.response?.data?.message || error?.message || 'Erro ao fazer login';
        toast.error(msg);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-4 mb-6">
            <img src="/icons/icon-192.png" alt="VEIMANFLOW logo" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold">Entrar</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Acesse sua conta VEIMANFLOW</p>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                aria-invalid={formik.touched.email && formik.errors.email ? 'true' : 'false'}
                className={`w-full p-3 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${
                  formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <p role="alert" className="text-red-500 text-sm mt-2">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div className="mb-2">
              <label htmlFor="senha" className="sr-only">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                placeholder="Senha"
                aria-invalid={formik.touched.senha && formik.errors.senha ? 'true' : 'false'}
                className={`w-full p-3 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${
                  formik.touched.senha && formik.errors.senha ? 'border-red-500' : 'border-gray-200'
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.senha}
              />
              {formik.touched.senha && formik.errors.senha && (
                <p role="alert" className="text-red-500 text-sm mt-2">
                  {formik.errors.senha}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="remember"
                  onChange={formik.handleChange}
                  checked={formik.values.remember}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>Lembrar-me</span>
              </label>
              <Link to="/forgot" className="text-sm text-blue-600 hover:underline">
                Esqueci a senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">ou</p>
            <div className="mt-4 flex gap-3 justify-center">
              <button className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
                Entrar com Google
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <img src="/icons/github.svg" alt="GitHub" className="w-5 h-5" />
                Entrar com GitHub
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
