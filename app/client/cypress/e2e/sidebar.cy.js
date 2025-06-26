Cypress.on("uncaught:exception", () => {
  return false;
});
describe("Sidebar", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Render basic sidebar", () => {
    cy.get("a").contains("Payments");
    cy.get("a").contains("Accounts");
  });

  it("Navigates to accounts", () => {
    cy.get('[data-cy="accountsLink"]').click();
    cy.location("pathname", { timeout: 60000 }).should("include", "/accounts");
  });

  it("Navigates to payments", () => {
    cy.get('[data-cy="paymentsLink"]').click();
    cy.location("pathname", { timeout: 60000 }).should("include", "/payments");
  });

  it("Navigates to accounts using logo", () => {
    cy.visit("/payments");
    cy.get('[data-cy="logo"]').click();
    cy.location("pathname", { timeout: 60000 }).should("include", "/accounts");
  });
});
