import 'cypress-axe';

Cypress.Commands.add('checkA11yPage', (options = {}) => {
  cy.injectAxe();
  cy.checkA11y(null, options);
});
