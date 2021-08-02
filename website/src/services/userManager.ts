import { createUserManager } from 'redux-oidc'

const redirectUri =
  typeof window !== 'undefined' && window && `${window.location.origin}`

// const isDevelopment = process.env.NODE_ENV !== 'production'

// const isIE11 =
//   typeof window !== 'undefined' &&
//   typeof document !== 'undefined' &&
//   !!window.MSInputMethodContext &&
//   !!document.DOCUMENT_NODE

const userManagerConfig = {
  client_id: process.env.ELVID_CLIENT_ID || '63db1528-e12a-455e-ad21-2bf929692c5d', // onetime-userclient (dev)
  redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/loginCallback`,
  response_type: 'code',
  scope: process.env.ELVID_SCOPE || 'ad_groups email onetime.useraccess openid profile',
  authority: process.env.ELVID_AUTHORITY || 'https://elvid.test-elvia.io/',
  silent_redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/silent_renew.html`,
  post_logout_redirect_uri: redirectUri || '',
  automaticSilentRenew: true,
  monitorSession: false,
  // monitorSession: isIE11 || isDevelopment ? false : true,
  filterProtocolClaims: true,
  loadUserInfo: true,
}

const userManager =
  createUserManager(userManagerConfig)
  // typeof window !== 'undefined' && createUserManager(userManagerConfig)

export default userManager
