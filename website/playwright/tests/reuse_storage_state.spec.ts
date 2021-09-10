import { test, expect } from '@playwright/test';
import path from 'path';
import globalSetup from './browser/globalSetup';
// import globalTeardown from './browser/globalTeardown';
const fs = require('fs');

globalSetup();

fs.readdirSync('.').forEach((file: any) => {
  console.log("TESTFILE:", file);
});

// https://nodejs.org/en/knowledge/file-system/how-to-read-files-in-nodejs/
fs.readFile('storage_state.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log("TESTDATA:", data);
});

console.log("__dirname:", __dirname);
console.log("path.dirname(__filename):", path.dirname(__filename));

test.use({ storageState: 'storage_state.json' });

test('reuse_storage_state', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');

  const signInOrSignOutButtonTitle = page.locator(
    'button#signInOrSignOutButton',
  );
  await expect(signInOrSignOutButtonTitle).toHaveText('Sign-Out');
  await signInOrSignOutButtonTitle.screenshot({
    path: 'tests/output/reuse_storage_state_signinorout_button.png',
  });

  const createButtonTitle = page.locator('a#createButton');
  await expect(createButtonTitle).toHaveText('Create');
  await createButtonTitle.screenshot({
    path: 'tests/output/reuse_storage_state_create_button.png',
  });

  const uploadButtonTitle = page.locator('a#uploadButton');
  await expect(uploadButtonTitle).toHaveText('Upload');
  await uploadButtonTitle.screenshot({
    path: 'tests/output/reuse_storage_state_upload_button.png',
  });

  await page.screenshot({ path: 'tests/output/reuse_storage_state.png' });
});
// globalTeardown();
