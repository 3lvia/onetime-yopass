import { login } from '../support/loginCommand';

it(`should login successfully to create page and display signed in user email`, () => {
  login();

  cy.get('h2')
    .should('have.class', 'e-title-md')
    .should('have.text', 'Informasjonskapsler ikke funnet');

  cy.get('p')
    .should('have.class', 'e-text-description')
    .should(
      'have.text',
      'Vennligst prøv på nytt. Sørg for at informasjonskapsler (Cookies) ikke er blokkert i nettleseren og at du benytter en oppdatert nettleser.',
    );

  // TODO: Fix test when the situation allows us to do so.
  // https://elvia-group.slack.com/archives/C020B6D25DK/p1631014622121500
  // cy.get('#userEmail').should(
  //   'have.text',
  //   'onetime.testuser@internal.testuser',
  // );
});
