import { login } from '../support/loginCommand';

// describe('Check csrf', () => {
//     it('Grabs Token and reloads', () => {
//         // get csrf token and output to command log
//         cy.request('#/create')
//         cy.visit('#/create')
//         .its('body')
//         .then((body) => {
//         const $html = Cypress.$(body)
//         const csrf = $html.find('input[name=_csrf_token]').val()
//         cy.log(csrf)
//         })

//         // do the same again
//         cy.request('#/create')
//         cy.visit('#/create')
//         .its('body')
//         .then((body) => {
//         const $html = Cypress.$(body)
//         const csrf = $html.find('input[name=_csrf_token]').val()
//         cy.log(csrf)
//         })
//     })
// })

it(`should login successfully to create page and display signed in user email`, () => {
  login();

  cy.get('#userEmail').should(
    'have.text',
    'onetime.testuser@internal.testuser',
  );
});
