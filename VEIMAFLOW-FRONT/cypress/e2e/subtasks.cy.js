describe('Subtasks Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@test.com');
    cy.get('input[type="password"]').type('senha123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should add a subtask to a task', () => {
    cy.visit('/tarefas');
    cy.wait(1000);

    // Open first task
    cy.get('[data-testid="task-card"]').first().click();
    cy.get('[data-testid="task-modal"]').should('be.visible');

    // Navigate to subtasks tab
    cy.contains('Subtarefas').click();

    // Add a new subtask
    const subtaskTitle = 'Test subtask from Cypress';
    cy.get('input[placeholder*="subtarefa"]').type(subtaskTitle);
    cy.contains('button', 'Adicionar').click();

    // Verify subtask appears
    cy.contains(subtaskTitle).should('be.visible');
  });

  it('should toggle subtask completion', () => {
    cy.visit('/tarefas');
    cy.wait(1000);

    cy.get('[data-testid="task-card"]').first().click();
    cy.get('[data-testid="task-modal"]').should('be.visible');

    cy.contains('Subtarefas').click();

    // If subtasks exist, toggle first checkbox
    cy.get('[data-testid="subtasks-section"]').within(() => {
      cy.get('input[type="checkbox"]').first().click();
    });

    // Progress should update (visual feedback)
    cy.wait(500);
  });
});
