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
    cy.visit("/service_status");
    cy.get('[data-cy="logo"]').click();
    cy.location("pathname", { timeout: 60000 }).should("include", "/accounts");
  });

  it("Navigates to service status - dropdown", () => {
    ["iphone-6", "ipad-2"].forEach((port) => {
      cy.viewport(port);
      cy.get('[data-cy="popover"]').click();
      cy.get('[data-cy="serviceStatusLink"]').click();
      cy.location("pathname", { timeout: 60000 }).should(
        "include",
        "/service_status"
      );
    });
  });

  it("Navigates to service status - macbook", () => {
    cy.viewport("macbook-16");
    cy.get('[data-cy="serviceStatusDesktopLink"]').click();
    cy.location("pathname", { timeout: 60000 }).should(
      "include",
      "/service_status"
    );
  });
});
