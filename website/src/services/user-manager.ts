import { createUserManager } from 'redux-oidc'

const redirectUri =
  typeof window !== 'undefined' && window && `${window.location.origin}`

const isDevelopment = process.env.NODE_ENV !== 'production'

const isIE11 =
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  !!window.MSInputMethodContext &&
  !!document.DOCUMENT_NODE

const userManagerConfig = {
  client_id: process.env.ELVID_CLIENT_ID || '',
  redirect_uri: `${redirectUri}/auth/signin` || '',
  response_type: 'code',
  scope: process.env.ELVID_SCOPE || '',
  authority: process.env.ELVID_AUTHORITY || '',
  silent_redirect_uri: `${redirectUri}/auth/silentrenew.html`,
  post_logout_redirect_uri: redirectUri || '',
  automaticSilentRenew: isIE11 || isDevelopment ? false : true,
  // monitorSession: isIE11 || isDevelopment ? false : true,
  monitorSession: false,
  filterProtocolClaims: true,
  loadUserInfo: true,
}

const userManager =
  typeof window !== 'undefined' && createUserManager(userManagerConfig)

export default userManager
