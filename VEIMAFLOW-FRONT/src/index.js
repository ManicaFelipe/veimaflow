// Entrypoint `src/index.js` — monta a aplicação React.
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
	// Garante que o container exista — se estiver faltando, registra para debug
	console.error('Elemento #root não encontrado. Verifique o arquivo public/index.html');
} else {
	createRoot(rootElement).render(
		<React.StrictMode>
			<AuthProvider>
				<App />
			</AuthProvider>
		</React.StrictMode>
	);
}
