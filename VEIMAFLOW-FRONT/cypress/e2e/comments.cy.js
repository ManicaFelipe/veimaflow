describe('Comments Flow', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@test.com');
    cy.get('input[type="password"]').type('senha123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should add a comment to a task', () => {
    // Navigate to Tarefas
    cy.visit('/tarefas');
    cy.wait(1000);

    // Open first task (assuming at least one exists in timeline or kanban)
    cy.get('[data-testid="task-card"]').first().click();
    
    // Wait for modal
    cy.get('[data-testid="task-modal"]').should('be.visible');

    // Navigate to comments tab if exists
    cy.contains('Comentários').click();

    // Add a new comment
    const commentText = 'Test comment from Cypress';
    cy.get('textarea[placeholder*="comentário"]').type(commentText);
    cy.contains('button', 'Adicionar').click();

    // Verify comment appears in list
    cy.contains(commentText).should('be.visible');
  });

  it('should load existing comments for a task', () => {
    cy.visit('/tarefas');
    cy.wait(1000);

    // Open first task
    cy.get('[data-testid="task-card"]').first().click();
    cy.get('[data-testid="task-modal"]').should('be.visible');

    // Go to comments
    cy.contains('Comentários').click();

    // Check if list renders (might be empty or have items)
    cy.get('[data-testid="comments-section"]').should('exist');
  });
});
