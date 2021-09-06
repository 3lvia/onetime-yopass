export const getTokenFromElvid = (
  clientId: string,
  clientSecret: string,
  username: string,
  password: string,
  tokenUrl: string,
) => {
  const options = {
    method: 'POST',
    url: tokenUrl,
    form: true,
    body: {
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret,
      username,
      password,
    },
  };

  return cy.request(options);
};

const createEpochTime = (minutesFromNow: number) =>
  new Date(new Date().getTime() + minutesFromNow * 60000).getTime() / 1000;

export const getLoginCredentials = () => {
  const vaultClientId = Cypress.env('VAULT_CLIENT_ID');
  const vaultClientSecret = Cypress.env('VAULT_CLIENT_SECRET');
  const username = Cypress.env('ONETIME_TEST_USER_EMAIL');
  const password = Cypress.env('ONETIME_TEST_USER_PASSWORD');
  const elvidScope = Cypress.env('ELVID_SCOPE');
  const elvidAuthority = Cypress.env('ELVID_AUTHORITY_URL');
  const tokenUrl = `${elvidAuthority}/connect/token`;

  return {
    vaultClientId,
    vaultClientSecret,
    username,
    password,
    elvidScope,
    tokenUrl,
  };
};

export const createStorage = (minutesUntilExpires: number) => {
  const elvidAuthority = Cypress.env('ELVID_AUTHORITY_URL');
  const elvidClientId = Cypress.env('ELVID_CLIENT_ID');
  const elvidScope = Cypress.env('ELVID_SCOPE');
  const expireTime = createEpochTime(minutesUntilExpires);
  const storageKey = `oidc.user:${elvidAuthority}:${elvidClientId}`;
  const storageValue = {
    token_type: 'Bearer',
    scope: elvidScope,
    expires_at: expireTime,
  };

  return { storageKey, storageValue };
};

export const getSecretFromVault = (
  token: string,
  address: string,
  elvidPath: string,
) => {
  const options = {
    method: 'GET',
    url: address + '/v1/' + elvidPath,
    headers: {
      'X-Vault-Token': token,
    },
  };

  return cy.request(options);
};
