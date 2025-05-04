class RegistrationPage {
  elements = {
    heading: () => cy.get("[data-cy='heading']"),
    submitButton: () => cy.get("[data-cy='submit']"),
    alertBox: () => cy.get("[data-cy='alert-box']"),
    alertCloseButton: () => cy.get("[data-cy='alert-close-btn']"),
  };

  visit() {
    cy.visit("/register");
    this.elements.heading().should("have.text", "Create an account");
  }

  submitForm() {
    this.elements.submitButton().click();
  }

  verifySubmitButtonState(isSending) {
    this.elements
      .submitButton()
      .should(isSending ? "have.text" : "not.have.text", "Sending...");
  }

  verifyAlertMessage(message) {
    this.elements.alertBox().should("be.visible").and("contain.text", message);
  }

  closeAlert() {
    this.elements.alertCloseButton().click();
    this.elements.alertBox().should("not.be.visible");
  }

  verifySuccessfulRegistration() {
    this.verifySubmitButtonState(true);
    cy.wait(5000); // Wait for 3 seconds after verifying button state
    cy.location("pathname").should("eq", "/channels/@me");
  }
}

export const registrationPage = new RegistrationPage();
