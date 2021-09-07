import {
  getTokenFromElvid,
  getLoginCredentials,
  createStorage,
  getSecretFromVault,
} from '../utils';

export const login = (minutesUntilExpires: number = 10) => {
  const { storageKey, storageValue } = createStorage(minutesUntilExpires);
  const {
    elvidMachineClientId,
    elvidMachineClientSecret,
    username,
    password,
    tokenUrl,
  } = getLoginCredentials();

  cy.log("getLoginCredentials:", getLoginCredentials())
  console.log("getLoginCredentials:", getLoginCredentials())

  if (elvidMachineClientId && elvidMachineClientSecret) {
    getTokenFromElvid(
      elvidMachineClientId,
      elvidMachineClientSecret,
      username,
      password,
      tokenUrl,
    ).then((response) => {
      const storageValueWithAccessToken = {
        ...storageValue,
        access_token: response.body.access_token,
      };

      cy.log("storageValueWithAccessToken:", storageValueWithAccessToken)
      console.log("storageValueWithAccessToken:", storageValueWithAccessToken)

      sessionStorage.setItem(
        storageKey,
        JSON.stringify(storageValueWithAccessToken),
      );

      cy.log("Access Token:", response.body.access_token)
    });
  } else {
    // pipeline in VSO
    // 1. get token from HASHI vault using VAULT_ROLE_ID environment variable
    // 2. get client_id and client_secret from vault
    // 3. get token from ELVID using client_id and client_secret

    const roleId = Cypress.env('VAULT_ROLE_ID');
    const vaultAddr = Cypress.env('VAULT_ADDR');

    const options = {
      method: 'POST',
      url: vaultAddr + '/v1/auth/approle/login',
      body: {
        role_id: roleId,
      },
    };

    cy.log("---- #1 ----")
    cy.request(options).then((response) => {
      cy.log('Obtained Vault token.');
      console.log('Obtained Vault token.');

      const vaultToken = response.body.auth.client_token;

      getSecretFromVault(
        vaultToken,
        vaultAddr,
        'onetime/kv/data/elvid/onetime-onetime-machineclient-testclient',
      ).then((response) => {
        cy.log('Got clientid, clientsecret and tokenendpoint from HashiCorp Vault.');
        console.log('Got clientid, clientsecret and tokenendpoint from HashiCorp Vault.');

        const data = response.body.data.data;
        const clientId = data['clientid'];
        const clientSecret = data['clientsecret'];
        const tokenEndpoint = data['tokenendpoint'];

        cy.log('Machine Client Data:', data);
        console.log('Machine Client Data:', data);

        getTokenFromElvid(
          clientId,
          clientSecret,
          username,
          password,
          tokenEndpoint,
        ).then((response) => {
          cy.log('Access Token from ElvID:', response.body.access_token);
          console.log('Access Token from ElvID:', response.body.access_token);

          const storageValueWithAccessToken = {
            ...storageValue,
            access_token: response.body.access_token,
          };

          sessionStorage.setItem(
            storageKey,
            JSON.stringify(storageValueWithAccessToken),
          );
        });
      });
    });
  }

  // Note that between every "it()" statement, cookies, localstorage and so on is deleted.
  // Meaning, the Cross-site request forgery (also known as CSRF) token provided by the server is being deleted.
  // https://github.com/cypress-io/cypress/issues/6677#issuecomment-596674205
  // https://docs.cypress.io/api/cypress-api/cookies#Turn-off-verbose-debugging-output
  // Cypress.Cookies.debug(true, { verbose: false })
  // Cypress.Cookies.debug(true)

  // Cypress.Commands.add('confirmCaptcha', function () {
  //   cy.get('iframe')
  //     .first()
  //     .then((recaptchaIframe) => {
  //       const body = recaptchaIframe.contents()
  //       cy.wrap(body).find('.recaptcha-checkbox-border').should('be.visible').click()
  //     })
  // })

  cy.visit('#/');
  cy.contains('Sign-In').click()
  cy.contains('Logg inn med e-post').click()
  username=getLoginCredentials().username
  cy.get('#Email').type(username)
  password=getLoginCredentials().password
  cy.get('#Password').type(password)
  cy.get('#LoginFormActionButton').click()

  // https://medium.com/tenets/cypress-identityserver4-cracking-the-oidc-protocol-6da42289731f
  // Cypress.Commands.add('IdentityServerAPILogin', (email, password) => {
  //   cy.intercept();
  //   const elvidAuthority = Cypress.env('ELVID_AUTHORITY_URL');

  //   cy.request('GET', elvidAuthority).then(response => {
  //     // Parses the html response to fetch the CSRF token
  //     const htmlDocument = document.createElement('html');
  //     htmlDocument.innerHTML = response.body;
  //     const loginForm = htmlDocument.getElementsByTagName('form')[0];
  //     const requestVerificationToken = loginForm.elements.__RequestVerificationToken.value;

  //     // Sends a valid request to thirdPartyServerUrl which sets the session cookies on a successful response
  //     cy.request({
  //       method: 'POST',
  //       url: elvidAuthority + '/loginEndpoint',
  //       followRedirect: false,
  //       form: true,
  //       body: {
  //         ReturnUrl: '',
  //         Email: email,
  //         Password: password,
  //         __RequestVerificationToken: requestVerificationToken
  //       }
  //     });
  //   });
  // });


  // Cypress.Commands.add("clickRecaptcha", () => {
  //   cy.window().then(win => {
  //     win.document
  //       .querySelector("iframe[src*='recaptcha']")
  //       .contentDocument.getElementById("recaptcha-token")
  //       .click();
  //   });
  // });
};
