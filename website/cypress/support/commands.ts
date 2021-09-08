// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import 'cypress-file-upload';

import { login } from './loginCommand';

declare global {
  namespace Cypress {
    interface Chainable {
      login: typeof login;
    }
  }
}

Cypress.Commands.add('login', (minutesUntilExpires = 10) =>
  login(minutesUntilExpires),
);

// https://stackoverflow.com/a/66137384
Cypress.Commands.add('confirmCaptcha', function () {
  cy.get('iframe')
    .first()
    .then((recaptchaIframe) => {
      const body = recaptchaIframe.contents();
      cy.wrap(body)
        .find('.recaptcha-checkbox-border')
        .should('be.visible')
        .click();
    });
});

// https://stackoverflow.com/a/60828421
Cypress.Commands.add('solveGoogleReCAPTCHA', () => {
  cy.get('#g-recaptcha *> iframe').then(($iframe) => {
    const $body = $iframe.contents().find('body');
    cy.wrap($body)
      .find('.recaptcha-checkbox-border')
      .should('be.visible')
      .click();
  });
});

// TODO: Fix automated OIDC sign in testing with Cypress.
// TODO: The issue with Cypress is when the browser redirects to another domain URI for authentication it breaks.
// TODO: The whole point of OAuth 2.0 and its various implementations are to restrict anyone from programmatically logging into a system.
// Cypress <> IdentityServer: Cracking the OIDC protocol
// https://medium.com/tenets/cypress-identityserver4-cracking-the-oidc-protocol-6da42289731f
Cypress.Commands.add('loginIdentityServer', (email, password) => {
  cy.server();
  const elvidAuthority = Cypress.env('ELVID_AUTHORITY_URL');

  cy.request('GET', elvidAuthority).then((response) => {
    // Parses the html response to fetch the CSRF token
    const htmlDocument = document.createElement('html');
    htmlDocument.innerHTML = response.body;
    const loginForm = htmlDocument.getElementsByTagName('form')[0];
    const requestVerificationToken =
      loginForm.elements.__RequestVerificationToken.value;

    // Sends a valid request to thirdPartyServerUrl which sets the session cookies on a successful response
    cy.request({
      method: 'POST',
      url: elvidAuthority + '/loginEndpoint',
      followRedirect: false,
      form: true,
      body: {
        ReturnUrl: '',
        Email: email,
        Password: password,
        __RequestVerificationToken: requestVerificationToken,
      },
    });
  });
});
