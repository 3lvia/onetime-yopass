import { AuthProviderProps } from 'oidc-react';

export const OidcConfiguration: AuthProviderProps = {
  autoSignIn: true,
  authority: process.env.REACT_APP_ELVID_AUTHORITY,
  clientId: process.env.REACT_APP_ELVID_CLIENT_ID,
  redirectUri: process.env.REACT_APP_ELVID_REDIRECT_URI,
  automaticSilentRenew: false
};

console.log(OidcConfiguration);
