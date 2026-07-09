import { test, expect } from '@playwright/test';

/**
 * Milestone 1B: Core Product Flow E2E
 * Amazon -> Extension (Mocked) -> Dashboard -> Search/Filter -> Delete
 */
test.describe('WishHub Milestone 1B E2E Flow', () => {
  test('should complete the full product lifecycle', async ({ page }) => {
    // 1. Setup: Start at Dashboard (Mocked Session)
    await page.goto('http://localhost:3000/dashboard');

    // 2. Verify Initial State
    const heading = page.getByRole('heading', { name: 'My Saved Products' });
    await expect(heading).toBeVisible();

    // 3. Simulate Extension Saving an Amazon Product
    // We call the API directly as if the extension was used
    const amazonProduct = {
      name: 'Amazon Echo Dot (5th Gen)',
      url: 'https://www.amazon.com/dp/B09B8V1LZ3',
      price: 49.99,
      currency: 'USD',
      storeName: 'Amazon',
      images: ['https://m.media-amazon.com/images/I/6182S7MYC2L._AC_SL1000_.jpg'],
      description: 'Smart speaker with Alexa'
    };

    await page.evaluate(async (product) => {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
    }, amazonProduct);

    // 4. Refresh and Verify in Dashboard
    await page.reload();
    await expect(page.getByText(amazonProduct.name)).toBeVisible();
    await expect(page.getByText('Amazon', { exact: true })).toBeVisible();
    await expect(page.getByText('USD 49.99')).toBeVisible();

    // 5. Test Search
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('Echo');
    await expect(page.getByText(amazonProduct.name)).toBeVisible();

    await searchInput.fill('NonExistent');
    await expect(page.getByText(amazonProduct.name)).not.toBeVisible();
    await expect(page.getByText('No products match your filters.')).toBeVisible();

    // Clear search
    await searchInput.fill('');

    // 6. Test Store Filter
    const storeFilter = page.locator('select').first();
    await storeFilter.selectOption('Amazon');
    await expect(page.getByText(amazonProduct.name)).toBeVisible();

    // 7. Test Optimistic Delete
    const deleteButton = page.locator('button:has(svg.lucide-trash2)').first();
    await deleteButton.click();

    // Should disappear immediately (Optimistic UI)
    await expect(page.getByText(amazonProduct.name)).not.toBeVisible();
    await expect(page.getByText('No products saved yet.')).toBeVisible();
  });
});
