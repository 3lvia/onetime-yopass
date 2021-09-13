import { test, expect } from '@playwright/test';
import globalSetup from './browser/globalSetup';
// import globalTeardown from './browser/globalTeardown';
import path from 'path';
const fs = require('fs');
let jsonObject: any;
// const storageStateFilePath = process.cwd() + path.sep + 'storage_state.json';
const storageStateFilePath = 'storage_state.json';

globalSetup();

fs.readdirSync(process.cwd()).forEach((file: any) => {
  var fileSizeInBytes = fs.statSync(file).size;
  console.log('File ', file, ' has ', fileSizeInBytes, ' bytes.');
});

console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);
console.log('path.dirname(__filename):', path.dirname(__filename));

// https://nodejs.org/en/knowledge/file-system/how-to-read-files-in-nodejs/
fs.readFile(storageStateFilePath, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  jsonObject = JSON.parse(data);
  console.log('Cookies:', jsonObject['cookies'][0].name);
  console.log('Cookies:', jsonObject['cookies'][0].expires);
});

test.use({ storageState: storageStateFilePath });

test('reuse_storage_state', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');

  console.log('Running reuse_storage_state test....');
  console.log('process.cwd():', process.cwd());
  console.log('__dirname:', __dirname);
  console.log('path.dirname(__filename):', path.dirname(__filename));
  fs.readFile(storageStateFilePath, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    jsonObject = JSON.parse(data);
    console.log('Cookies:', jsonObject['cookies'][0].name);
    console.log('Cookies:', jsonObject['cookies'][0].expires);
    console.log('Cookies:', jsonObject['cookies'][1].name);
    console.log('Cookies:', jsonObject['cookies'][1].expires);
  });

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
