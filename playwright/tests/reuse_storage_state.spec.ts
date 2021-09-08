import { test } from '@playwright/test';
import globalSetup from './browser/globalSetup';
import globalTeardown from './browser/globalTeardown';

globalSetup();
test.use({ storageState: 'storage_state.json' });
test('reuse_storage_state', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.screenshot({ path: 'tests/output/reuse_storage_state.png' });
});
// globalTeardown();
