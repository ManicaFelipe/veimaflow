import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

export default function BackendStatus() {
  const [status, setStatus] = useState('checking'); // checking | online | offline
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    check();
    const interval = setInterval(check, 15000); // Verifica a cada 15s
    return () => clearInterval(interval);
  }, []);

  async function check() {
    try {
      // Usa o endpoint de health check público
      await axios.get('/api/health', { timeout: 3000 });
      setStatus('online');
      setLastCheck(new Date());
    } catch (err) {
      console.warn('[BackendStatus] Backend offline:', err.message);
      setStatus('offline');
      setLastCheck(new Date());
    }
  }

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center gap-2 text-sm">
        <FiAlertCircle className="text-yellow-500 animate-pulse" />
        <span>Verificando backend...</span>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 flex items-center gap-2 text-sm">
        <FiXCircle className="text-red-600 dark:text-red-400" />
        <div>
          <div className="font-semibold">Backend Offline</div>
          <div className="text-xs opacity-75">Última verificação: {lastCheck?.toLocaleTimeString()}</div>
          <button onClick={check} className="mt-1 px-2 py-0.5 rounded bg-red-600 text-white text-xs hover:bg-red-700">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Online - mostra discreto
  return (
    <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity">
      <FiCheckCircle className="text-green-600 dark:text-green-400" />
      <div>
        <div className="font-semibold">Backend Online</div>
        <div className="text-xs opacity-75">{lastCheck?.toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
