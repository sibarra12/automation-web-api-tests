// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('setupAlertHandler', () => {
  cy.window().then((win) => {
    cy.stub(win, 'alert').as('alertStub');
  });
});

Cypress.Commands.add('verifyAlertMessage', (expectedMessage) => {
  cy.get('@alertStub').should('have.been.calledWith', expectedMessage);
});

Cypress.Commands.add('clickElement', (locator) => {
  cy.get(locator).should('exist').should('be.visible').click();
});

Cypress.Commands.add('clickElementContains', (locator, text) => {
  cy.get(locator).contains(text).should('exist').should('be.visible').click();
});

Cypress.Commands.add('typeElement', (locator, text) => {
  cy.get(locator).should('exist').should('be.visible').type(text).should('have.value', text);
});


