/**
 * Fill complete registration form with user data
 * @param {Object} userData - User registration data
 */
Cypress.Commands.add("fillRegistrationForm", (userData) => {
  // Fill basic information
  if (userData.email) {
    cy.get('[data-cy="email"]').clear().type(userData.email);
  }
  if (userData.username) {
    cy.get('[data-cy="username"]').clear().type(userData.username);
  }
  if (userData.password) {
    cy.get('[data-cy="password"]').clear().type(userData.password);
  }

  // Fill date of birth if provided
  if (userData.dob) {
    if (userData.dob.date !== undefined) {
      cy.get('[data-cy="date"]').click();
      cy.get('ul[role="listbox"] > li').eq(userData.dob.date).click();
    }
    if (userData.dob.month !== undefined) {
      cy.get('[data-cy="month"]').click();
      cy.get('ul[role="listbox"] > li').eq(userData.dob.month).click();
    }
    if (userData.dob.year !== undefined) {
      cy.get('[data-cy="year"]').click();
      cy.get('ul[role="listbox"] > li').eq(userData.dob.year).click();
    }
  }
});
