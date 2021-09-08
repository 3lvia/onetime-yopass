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

  cy.log('getLoginCredentials:', getLoginCredentials());

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

      cy.log('storageValueWithAccessToken:', storageValueWithAccessToken);

      sessionStorage.setItem(
        storageKey,
        JSON.stringify(storageValueWithAccessToken),
      );

      cy.log('Access Token:', response.body.access_token);
    });
  } else {
    const roleId = Cypress.env('VAULT_ROLE_ID');
    const vaultAddr = Cypress.env('VAULT_ADDR');

    const options = {
      method: 'POST',
      url: vaultAddr + '/v1/auth/approle/login',
      body: {
        role_id: roleId,
      },
    };

    cy.log('---- #1 ----');
    cy.request(options).then((response) => {
      cy.log('Obtained Vault token.');

      const vaultToken = response.body.auth.client_token;

      getSecretFromVault(
        vaultToken,
        vaultAddr,
        'onetime/kv/data/elvid/onetime-onetime-machineclient-testclient',
      ).then((response) => {
        cy.log(
          'Got clientid, clientsecret and tokenendpoint from HashiCorp Vault.',
        );

        const data = response.body.data.data;
        const clientId = data['clientid'];
        const clientSecret = data['clientsecret'];
        const tokenEndpoint = data['tokenendpoint'];

        cy.log('Machine Client Data:', data);

        getTokenFromElvid(
          clientId,
          clientSecret,
          username,
          password,
          tokenEndpoint,
        ).then((response) => {
          cy.log('Access Token from ElvID:', response.body.access_token);

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

  // Note that between every "it()" statement, cookies, local storage and so on is deleted.
  // Meaning, the Cross-site request forgery (also known as CSRF) token provided by the server is being deleted.
  // https://github.com/cypress-io/cypress/issues/6677#issuecomment-596674205
  // https://docs.cypress.io/api/cypress-api/cookies#Turn-off-verbose-debugging-output
  Cypress.Cookies.debug(true, { verbose: false });

  cy.visit('#/');
  cy.contains('Sign-In').click();
  cy.contains('Logg inn med e-post').click();

  cy.get('#LoginFormContainer').within(() => {
    let emailInputValue = getLoginCredentials().username;
    cy.get('#Email').type(emailInputValue);
    let passwordInputValue = getLoginCredentials().password;
    cy.get('#Password').type(passwordInputValue);
  });

  cy.get('#LoginFormSectionAction').within(() => {
    cy.get('#LoginFormActionButton').click();
  });
};
