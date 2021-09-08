import { test } from '@playwright/test';

test('signin_yopass', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.click('button#signInOrSignOutButton');
  await page.click('span:has-text("Logg inn med e-post")');
  await page.fill('#Email', process.env.ONETIME_TEST_USER_EMAIL);
  await page.fill('#Password', process.env.ONETIME_TEST_USER_PASSWORD);
  await page.click('button#LoginFormActionButton');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/output/signin.png' });
});
