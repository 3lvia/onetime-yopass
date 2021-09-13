import { test, expect } from '@playwright/test';
import globalSetup from './browser/globalSetup';
import path from 'path';
// const storageStateFileName = 'storage_state.json';
// const storageStateFilePath = process.cwd() + path.sep + storageStateFileName;

test.beforeEach(async ({ page }) => {
  await globalSetup();
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
});

// test.use({ storageState: storageStateFilePath });

test('blank_setup', async ({ page }) => {
  const description = page.locator('span#blankPageDescription');
  await expect(description).toHaveText('This page intentionally left blank.');
});
