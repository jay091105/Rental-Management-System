import { test, expect } from '@playwright/test';

test.describe('Publish toggle visibility', () => {
  test('non-admin (provider) should not see publish toggle on Add Product', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'provider' }));
      localStorage.setItem('token', 'fake-token');
    });

    await page.goto('/properties/add');
    const label = page.locator('text=Publish product');
    await expect(label).toHaveCount(0);
  });

  test('admin should see publish toggle on Add Product', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({ id: 'admin', role: 'admin' }));
      localStorage.setItem('token', 'fake-token');
    });

    await page.goto('/properties/add');
    const label = page.locator('text=Publish product');
    await expect(label).toHaveCount(1);
  });
});