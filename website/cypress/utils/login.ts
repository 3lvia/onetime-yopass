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

  cy.log("---- #2 ----")
  return cy.request(options);
};

const createEpochTime = (minutesFromNow: number) =>
  new Date(new Date().getTime() + minutesFromNow * 60000).getTime() / 1000;

export const getLoginCredentials = () => {
  const elvidMachineClientId = Cypress.env('ELVID_MACHINE_CLIENT_ID');
  cy.log("elvidMachineClientId:", elvidMachineClientId)
  const elvidMachineClientSecret = Cypress.env('ELVID_MACHINE_CLIENT_SECRET');
  cy.log("elvidMachineClientSecret:", elvidMachineClientSecret)

  const username = Cypress.env('ONETIME_TEST_USER_EMAIL');
  const password = Cypress.env('ONETIME_TEST_USER_PASSWORD');
  const elvidScope = Cypress.env('ELVID_SCOPE');
  const elvidAuthority = Cypress.env('ELVID_AUTHORITY_URL');
  const tokenUrl = `${elvidAuthority}/connect/token`;

  return {
    elvidMachineClientId,
    elvidMachineClientSecret,
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
  console.log("GetSecretFromVault.token:", token)
  console.log("GetSecretFromVault.address:", address)
  console.log("GetSecretFromVault.elvidPath:", elvidPath)

  const options = {
    method: 'GET',
    url: address + '/v1/' + elvidPath,
    headers: {
      'X-Vault-Token': token,
    },
  };

  cy.log("---- #3----")
  return cy.request(options);
};
