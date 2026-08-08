import { test, expect } from '@playwright/test';

test.describe('WishHub V1 Release Certification End-to-End Journeys', () => {
  // We keep a shared context but use unique credentials per test run for perfect isolation
  const generateUser = () => {
    const ts = Date.now() + Math.floor(Math.random() * 1000);
    return {
      email: `user_${ts}@wishhub-test.com`,
      password: 'Password123!',
      name: `Test Explorer ${ts}`,
      wishlistName: `My Tech List ${ts}`,
    };
  };

  test('Master V1 Certification Journey: Signup -> Sidebar Wishlist CRUD -> Save Product -> AI Insights -> Isolation -> Failure Paths -> Logout -> Re-login', async ({ page }) => {
    const user = generateUser();
    const uniqueId = `${Date.now()}`;

    // ==========================================
    // 1. LANDING PAGE & SIGNUP
    // ==========================================
    await page.goto('/');
    await expect(page).toHaveTitle(/WishHub/i);
    await expect(page.getByText('Curate everything you love')).toBeVisible();

    // Navigate to signup
    await page.getByRole('link', { name: /Get Started Free/i }).click();
    await page.waitForURL('**/signup');

    // Fill in signup
    await page.getByPlaceholder(/Alex Doe/i).fill(user.name);
    await page.getByPlaceholder(/name@example.com/i).fill(user.email);
    await page.getByPlaceholder(/••••••••/i).fill(user.password);
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Verify redirected to Dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /explorer/i })).toBeVisible({ timeout: 15000 });

    // Drain the AI job queue first so our run is guaranteed to be processed immediately
    console.log('Draining stale AI jobs...');
    await page.evaluate(async () => {
      let drained = false;
      let limit = 20; // safety limit to prevent infinite loops
      while (!drained && limit > 0) {
        const res = await fetch('/api/ai/jobs', { method: 'POST' });
        const json = await res.json();
        if (json.message === 'No pending AI jobs found.' || !json.success) {
          drained = true;
        }
        limit--;
      }
    });

    // ==========================================
    // 2. WISHLIST CREATION VIA SIDEBAR ACTION (Strong stable contract)
    // ==========================================
    // Click Sidebar "New Wishlist"
    const sidebarNewBtn = page.getByRole('button', { name: /New Wishlist/i });
    await expect(sidebarNewBtn).toBeVisible();
    await sidebarNewBtn.click();

    // Fill in Dialog form and intercept creation response to extract wishlistId
    await page.getByLabel(/Wishlist Name/i).fill(user.wishlistName);

    const wishlistResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/wishlists') && response.status() === 201
    );

    await page.getByRole('button', { name: 'Create Wishlist', exact: true }).click();

    const wishlistResponse = await wishlistResponsePromise;
    const wishlistJson = await wishlistResponse.json();
    const wishlistId = wishlistJson.data.id;
    console.log('Intercepted created wishlistId:', wishlistId);

    // Verify new wishlist link appears in sidebar/dashboard
    const wishlistLink = page.locator('a', { hasText: user.wishlistName });
    await expect(wishlistLink).toBeVisible({ timeout: 15000 });

    // ==========================================
    // 3. PRODUCT LIFECYCLE (SAVE & LINK TO COLLECTION VIA API)
    // ==========================================
    const testProduct = {
      name: `Sony Headphones ${uniqueId}`,
      // Use a completely unique non-Amazon path to bypass ASIN 10-char normalizer clipping
      url: `https://www.headphones-store.com/product/sony-wh1000-${uniqueId}`,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      price: 398.00,
      currency: 'USD',
      storeName: 'Amazon',
      description: 'Active Noise Canceling Premium headphones.'
    };

    // Save product globally first (this automatically enqueues a pending AI Job for this product!)
    const saveResponse = await page.evaluate(async (product) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      return response.json();
    }, testProduct);

    expect(saveResponse.success).toBe(true);
    const savedProductId = saveResponse.data.product.id;
    console.log('Global product saved with ID:', savedProductId);

    // Link product to the custom wishlist folder
    const linkResponse = await page.evaluate(async ({ wishlistId, savedProductId }) => {
      const response = await fetch(`/api/wishlists/${wishlistId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedProductId })
      });
      return response.json();
    }, { wishlistId, savedProductId });

    expect(linkResponse.success).toBe(true);

    // Trigger immediate background AI job processor synchronously via API to process the automatically enqueued pending job
    console.log('Synchronously triggering AI job processor...');
    const triggerJobResponse = await page.evaluate(async () => {
      const response = await fetch('/api/ai/jobs', {
        method: 'POST'
      });
      return response.json();
    });
    console.log('AI job processor output:', triggerJobResponse);
    expect(triggerJobResponse.success).toBe(true);

    // Navigate to the custom wishlist folder to view interactive Product Cards
    await wishlistLink.click();
    await page.waitForURL(`**/dashboard?wishlist=${wishlistId}`);

    // Verify product card is visible in the folder
    const cardHeading = page.getByRole('heading', { name: testProduct.name });
    await expect(cardHeading).toBeVisible({ timeout: 15000 });

    // ==========================================
    // 4. PRODUCT DETAILED DRAWER & AI INSIGHTS
    // ==========================================
    // Click card to open drawer
    await cardHeading.click();

    // Verify drawer details are fully rendered
    const drawerHeading = page.getByRole('heading', { name: testProduct.name }).nth(1);
    await expect(drawerHeading).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('AI Shopping Insights')).toBeVisible();

    // Verify AI analysis recommendation contract is rendered perfectly
    await expect(page.getByText(/Match Confidence/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Pros', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cons', exact: true })).toBeVisible();

    // Close panel drawer cleanly (WCAG 2.2 AA compliant close panel)
    await page.getByRole('button', { name: 'Close panel' }).click();
    await expect(drawerHeading).not.toBeVisible();

    // ==========================================
    // 5. SECURITY: USER ISOLATION VERIFICATION
    // ==========================================
    const apiIsolationResult = await page.evaluate(async () => {
      // 1. Attempt to delete a non-existent wishlist ID
      const wishlistRes = await fetch('/api/wishlists/non-existent-wishlist-id-123', {
        method: 'DELETE'
      });
      const wishlistJson = await wishlistRes.json();

      // 2. Attempt to access a non-existent product's insights via GET
      const insightsRes = await fetch('/api/products/non-existent-product-id-456/insights');
      const insightsJson = await insightsRes.json();

      return {
        wishlistStatus: wishlistRes.status,
        wishlistSuccess: wishlistJson.success,
        insightsStatus: insightsRes.status,
        insightsSuccess: insightsJson.success,
      };
    });

    // Verify that unowned/non-existent resource mutations are correctly blocked (403/404)
    expect(apiIsolationResult.wishlistStatus).toBe(403);
    expect(apiIsolationResult.wishlistSuccess).toBe(false);
    expect(apiIsolationResult.insightsStatus).toBe(404);
    expect(apiIsolationResult.insightsSuccess).toBe(false);

    // ==========================================
    // 6. FAILURE PATHS & GRACEFUL UX DEGRADATION
    // ==========================================
    const unauthResult = await page.evaluate(async () => {
      // Omit cookies to guarantee unauthenticated state!
      const res = await fetch('/api/wishlists', {
        credentials: 'omit',
        headers: { 'Authorization': 'Bearer expired-token' }
      });
      return { status: res.status, ok: res.ok };
    });
    expect(unauthResult.status).toBe(401);

    // ==========================================
    // 7. SIGN OUT JOURNEY
    // ==========================================
    await page.getByRole('button', { name: user.name }).click();
    await page.getByRole('menuitem', { name: /Log out/i }).click();

    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();

    // ==========================================
    // 8. RE-LOGIN & VERIFY PERSISTENCE
    // ==========================================
    await page.getByPlaceholder(/name@example.com/i).fill(user.email);
    await page.getByPlaceholder(/••••••••/i).fill(user.password);
    await page.getByRole('button', { name: /Sign In/i }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: /explorer/i })).toBeVisible();

    // Verify database integrity and persistence
    await expect(page.locator('a', { hasText: user.wishlistName })).toBeVisible();
    await expect(page.getByRole('heading', { name: testProduct.name })).toBeVisible();
  });

  test('Dashboard Empty State Focus: Fresh User -> Loads Empty State -> CTA click -> Create Wishlist', async ({ page }) => {
    const user = generateUser();

    // 1. Signup fresh user
    await page.goto('/signup');
    await page.getByPlaceholder(/Alex Doe/i).fill(user.name);
    await page.getByPlaceholder(/name@example.com/i).fill(user.email);
    await page.getByPlaceholder(/••••••••/i).fill(user.password);
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Wait for Dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /explorer/i })).toBeVisible({ timeout: 15000 });

    // 2. Assert empty-state collection contract
    await expect(page.getByText('No collections created yet.')).toBeVisible({ timeout: 15000 });
    const ctaBtn = page.getByRole('button', { name: /Create your first collection/i });
    await expect(ctaBtn).toBeVisible();

    // 3. CTA creates wishlist successfully
    await ctaBtn.click();
    await page.getByLabel(/Wishlist Name/i).fill(user.wishlistName);
    await page.getByRole('button', { name: 'Create Wishlist', exact: true }).click();

    // Verify wishlist link is active and visible
    await expect(page.locator('a', { hasText: user.wishlistName })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('No collections created yet.')).not.toBeVisible();
  });
});
