/// <reference types="cypress" />

describe('Accessibility (a11y) checks', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('Homepage should have no detectable a11y violations', () => {
    cy.checkA11y();
  });

  it('Products page should have no detectable a11y violations', () => {
    cy.visit('/products');
    cy.injectAxe();
    cy.checkA11y();
  });
});
