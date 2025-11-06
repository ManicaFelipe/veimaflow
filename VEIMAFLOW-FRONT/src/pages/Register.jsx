import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const registerSchema = Yup.object().shape({
  nome: Yup.string().required('Nome é obrigatório'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  senha: Yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
  cargo: Yup.string().required('Cargo é obrigatório'),
  time: Yup.string().required('Time é obrigatório'),
});

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { nome: '', email: '', senha: '', cargo: '', time: '' },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        await register(values.email, values.senha, values.nome, values.cargo, values.time);
        toast.success('Conta criada com sucesso!');
        navigate('/dashboard');
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || 'Erro ao registrar');
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-bold mb-4">Criar conta</h1>

          <form onSubmit={formik.handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="nome" className="sr-only">Nome</label>
              <input
                id="nome"
                name="nome"
                autoComplete="name"
                placeholder="Seu nome"
                className={`w-full p-3 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${formik.touched.nome && formik.errors.nome ? 'border-red-500' : 'border-gray-200'}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.nome}
              />
              {formik.touched.nome && formik.errors.nome && (
                <p role="alert" className="text-red-500 text-sm mt-2">{formik.errors.nome}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className={`w-full p-3 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-200'}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <p role="alert" className="text-red-500 text-sm mt-2">{formik.errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="senha" className="sr-only">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="new-password"
                placeholder="Senha"
                className={`w-full p-3 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${formik.touched.senha && formik.errors.senha ? 'border-red-500' : 'border-gray-200'}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.senha}
              />
              {formik.touched.senha && formik.errors.senha && (
                <p role="alert" className="text-red-500 text-sm mt-2">{formik.errors.senha}</p>
              )}
            </div>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="cargo" className="sr-only">Cargo</label>
                <input
                  id="cargo"
                  name="cargo"
                  placeholder="Cargo"
                  className={`w-full p-3 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${formik.touched.cargo && formik.errors.cargo ? 'border-red-500' : 'border-gray-200'}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.cargo}
                />
                {formik.touched.cargo && formik.errors.cargo && (
                  <p role="alert" className="text-red-500 text-sm mt-2">{formik.errors.cargo}</p>
                )}
              </div>
              <div>
                <label htmlFor="time" className="sr-only">Time</label>
                <input
                  id="time"
                  name="time"
                  placeholder="Time"
                  className={`w-full p-3 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${formik.touched.time && formik.errors.time ? 'border-red-500' : 'border-gray-200'}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.time}
                />
                {formik.touched.time && formik.errors.time && (
                  <p role="alert" className="text-red-500 text-sm mt-2">{formik.errors.time}</p>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full p-3 rounded text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? 'Carregando...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">Já tem uma conta? <a href="/login" className="text-blue-600 hover:underline">Entrar</a></p>
        </div>
      </div>
    </div>
  );
}
