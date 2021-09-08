Cypress.Commands.add('IdentityServerAPILogin', (email, password) => {
  cy.intercept();
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
