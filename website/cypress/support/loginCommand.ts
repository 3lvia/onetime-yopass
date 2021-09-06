import {
  getTokenFromElvid,
  getLoginCredentials,
  createStorage,
  getSecretFromVault,
} from '../utils';

export const login = (minutesUntilExpires: number = 10) => {
  const { storageKey, storageValue } = createStorage(minutesUntilExpires);
  const {
    vaultClientId,
    vaultClientSecret,
    username,
    password,
    tokenUrl,
  } = getLoginCredentials();

  if (vaultClientId && vaultClientSecret) {
    getTokenFromElvid(
      vaultClientId,
      vaultClientSecret,
      username,
      password,
      tokenUrl,
    ).then((response) => {
      const storageValueWithAccessToken = {
        ...storageValue,
        access_token: response.body.access_token,
      };

      sessionStorage.setItem(
        storageKey,
        JSON.stringify(storageValueWithAccessToken),
      );
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

    cy.request(options).then((response) => {
      cy.log('Got vault_token from vault');

      const vaultToken = response.body.auth.client_token;

      getSecretFromVault(
        vaultToken,
        vaultAddr,
        'kunde/kv/data/elvid/kunde-portal-api-testclient',
      ).then((response) => {
        cy.log('Got clientid, clientsecret and tokenendpoint from vault');

        const data = response.body.data.data;
        const clientId = data['clientid'];
        const clientSecret = data['clientsecret'];
        const tokenEndpoint = data['tokenendpoint'];

        getTokenFromElvid(
          clientId,
          clientSecret,
          username,
          password,
          tokenEndpoint,
        ).then((response) => {
          cy.log('Got user_token from Elvid');

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

  cy.visit('/minside');
};
