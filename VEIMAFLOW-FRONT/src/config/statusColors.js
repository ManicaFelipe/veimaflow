// Mapeamento de cores para status (light/dark). Personalize aqui.
export const STATUS_COLORS = {
  Pendente: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  Planejado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'Em andamento': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Concluido: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  Concluida: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  Pausado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  Cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export function getStatusBadgeClasses(status) {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}
