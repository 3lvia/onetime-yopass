# Cypress

## Getting Started

```bash
yarn \
    && yarn add --dev cypress \
    && yarn run format \
    && yarn run cy-test

npx cypress run \
    --headless

npx cypress run \
    --headless \
    --spec="cypress/integration/create_secret.ts"

npx cypress run \
    --headless \
    --spec="cypress/integration/load_website.ts"

npx cypress open \
    --env VAULT_ROLE_ID="${VAULT_ROLE_ID}",VAULT_ADDR="${VAULT_ADDR}",USERNAME="${USERNAME}",PASSWORD="${PASSWORD}",ELVID_AUTHORITY="${ELVID_AUTHORITY}",ELVID_CLIENT_ID="${ELVID_CLIENT_ID}",ELVID_SCOPE="${ELVID_SCOPE}"

npx cypress open

npx cypress run \
    --headless \
    --spec="cypress/integration/signin_testuser.ts"

npx cypress run \
    --headless \
    --spec="cypress/integration/upload_file.ts"
```
