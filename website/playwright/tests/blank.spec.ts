import { test, expect } from '@playwright/test';

test('blank', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  const description = page.locator('span#blankPageDescription');
  await expect(description).toHaveText('This page intentionally left blank.');

  const signInOrSignOutButtonTitle = page.locator(
    'button#signInOrSignOutButton',
  );
  await expect(signInOrSignOutButtonTitle).toHaveText('Sign-In');
  await page.screenshot({ path: 'tests/output/blank.png' });
});
