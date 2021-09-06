import { login } from '../support/loginCommand';

it(`should login successfully to create page and display signed in user email`, () => {
  login();

  cy.get('#userEmail').should(
    'have.text',
    'onetime.testuser@internal.testuser',
  );
});
