import { chromium } from '@playwright/test';
const fs = require('fs');

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

  await page.context().storageState({ path: 'storage_state.json' });

  fs.readdirSync('.').forEach((file: any) => {
    console.log("FILE:", file);
  });

  // https://nodejs.org/en/knowledge/file-system/how-to-read-files-in-nodejs/
  fs.readFile('storage_state.json', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    console.log("DATA:", data);
  });

  // const cookies = await page.context().cookies();
  // const cookieJson = JSON.stringify(cookies);
  // fs.writeFileSync('cookies.json', cookieJson);

  await browser.close();
}
export default globalSetup;
