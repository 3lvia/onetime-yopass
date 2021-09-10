import { chromium } from '@playwright/test';
import path from 'path';
const fs = require('fs');
let jsonObject: any;
const storageStateFileName = 'storage_state.json';

async function globalSetup() {
  // console.log('Global setup....');

  const browser = await chromium.launch();
  // const context = await browser.newContext();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/');
  await page.click('button#signInOrSignOutButton');
  await page.click('span:has-text("Logg inn med e-post")');

  await page.fill('#Email', process.env.ONETIME_TEST_USER_EMAIL);
  await page.fill('#Password', process.env.ONETIME_TEST_USER_PASSWORD);

  await page.click('button#LoginFormActionButton');
  await page.waitForLoadState('networkidle');

  await page.context().storageState({ path: storageStateFileName });

  fs.readdirSync('.').forEach((file: any) => {
    console.log('Current Directory Files:', file);
  });

  // https://nodejs.org/en/knowledge/file-system/how-to-read-files-in-nodejs/
  // https://stackoverflow.com/a/10011174
  fs.readFile(storageStateFileName, 'utf8', function (err, data) {
    if (err) {
      return console.log('ReadFile Error:', err);
    }
    console.log(data);
    jsonObject = JSON.parse(data);
    console.log('Cookies:', jsonObject['cookies'][0].name);
    console.log('Cookies:', jsonObject['cookies'][0].expires);
    console.log('Cookies:', jsonObject['cookies'][1].name);
    console.log('Cookies:', jsonObject['cookies'][1].expires);
  });

  console.log('__dirname:', __dirname);
  console.log('path.dirname(__filename):', path.dirname(__filename));

  // const cookies = await page.context().cookies();
  // const cookieJson = JSON.stringify(cookies);
  // fs.writeFileSync('cookies.json', cookieJson);

  await browser.close();
}
export default globalSetup;
