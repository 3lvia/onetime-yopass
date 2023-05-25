import { UserManager } from 'oidc-react';

if (process.env.REACT_APP_ELVID_AUTHORITY === undefined) {
  throw new Error('Missing env var REACT_APP_ELVID_AUTHORITY');
}
if (process.env.REACT_APP_ELVID_CLIENT_ID === undefined) {
  throw new Error('Missing env var REACT_APP_ELVID_CLIENT_ID');
}
if (process.env.REACT_APP_ELVID_REDIRECT_URI === undefined) {
  throw new Error('Missing env var REACT_APP_ELVID_REDIRECT_URI');
}

const OidcUserManager = new UserManager({
  authority: process.env.REACT_APP_ELVID_AUTHORITY,
  client_id: process.env.REACT_APP_ELVID_CLIENT_ID,
  redirect_uri: process.env.REACT_APP_ELVID_REDIRECT_URI,
  response_type: 'code',
  scope: process.env.REACT_APP_ELVID_SCOPE,
  loadUserInfo: true,
  post_logout_redirect_uri:
    process.env.REACT_APP_ELVID_POST_LOGOUT_REDIRECT_URI,
  silent_redirect_uri: process.env.REACT_APP_ELVID_REDIRECT_URI,
  automaticSilentRenew: true,
});

export default OidcUserManager;
