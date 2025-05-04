/// <reference types="cypress"/>

describe("Checking login page behavior", () => {
  beforeEach(() => {
    cy.visit("/login");
  });
  it("check standard login", () => {
    // cy.visit("https://qa2.dev.tellius.com/login");
    // cy.get(".text-center > .MuiButtonBase-root").click();
  });
});
