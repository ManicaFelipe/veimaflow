describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('deve mostrar mensagem de erro para credenciais inválidas', () => {
    cy.get('input[name="email"]').type('teste@exemplo.com');
    cy.get('input[name="password"]').type('senha123');
    cy.get('button[type="submit"]').click();
    cy.contains('Erro ao fazer login').should('be.visible');
  });

  it('deve redirecionar para dashboard após login bem sucedido', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-token',
        user: { id: 1, name: 'Teste' },
      },
    }).as('loginRequest');

    cy.get('input[name="email"]').type('usuario@real.com');
    cy.get('input[name="password"]').type('senha-correta');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
  });
});