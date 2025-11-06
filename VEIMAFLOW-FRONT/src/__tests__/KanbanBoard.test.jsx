import { render, screen } from '@testing-library/react';
import KanbanBoard from '../components/KanbanBoard';

describe('KanbanBoard', () => {
  it('renderiza o título corretamente', () => {
    render(<KanbanBoard />);
    expect(screen.getByText('Kanban')).toBeInTheDocument();
  });

  it('mostra colunas padrão quando não há tarefas', () => {
    render(<KanbanBoard />);
    expect(screen.getByText('Planejado')).toBeInTheDocument();
  });
});