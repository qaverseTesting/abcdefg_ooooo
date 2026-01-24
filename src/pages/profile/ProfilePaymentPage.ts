// src/pages/profile/ProfilePaymentPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class ProfilePaymentPage extends BasePage {
  private readonly paymentTypeSelect: Locator;
  private readonly setGroupPaymentTypeText: Locator;

  constructor(page: Page) {
    super(page);

    // Stable anchors
    this.paymentTypeSelect = page.locator('select[name="paymentType"]');
    this.setGroupPaymentTypeText = page.locator('text=Set Group Payment Type');
  }

  /**
   * Wait for Profile → Payments page after successful activation
   * (SPA-safe, CI-safe)
   */
  async waitForProfilePaymentPage(): Promise<void> {
    Logger.step('Waiting for Profile Payments page');

    // Soft URL check (do NOT depend on ref)
    await this.page.waitForFunction(
      () => window.location.pathname.includes('/user/profile/payments'),
      { timeout: 30_000 }
    );

    // Hard UI checks (source of truth)
    await expect(
      this.paymentTypeSelect,
      'Payment type select should be visible'
    ).toBeVisible({ timeout: 30_000 });

    await expect(
      this.setGroupPaymentTypeText,
      '"Set Group Payment Type" text should be visible'
    ).toBeVisible({ timeout: 30_000 });

    Logger.success('Profile Payments page loaded successfully');
  }

  /**
   * Assert activated group via URL ref parameter (ONLY if present)
   * CI-safe, SPA-safe
   */
async assertActivatedGroupRef(expectedGroupName: string): Promise<void> {
  Logger.step('Checking activated group via URL ref (if present)');

  // Do NOT wait for networkidle (SPA unsafe)
  // Just read the current URL
  const url = new URL(this.page.url());
  const actualRef = url.searchParams.get('ref');

  if (!actualRef) {
    Logger.warn('URL ref parameter not present — skipping ref assertion');
    return;
  }

  const normalizedExpectedRef = expectedGroupName
    .toLowerCase()
    .split('\n')[0]
    .trim()
    .replace(/\s+/g, '-');

  Logger.info(`Expected ref: "${normalizedExpectedRef}"`);
  Logger.info(`Actual ref: "${actualRef}"`);

  expect(actualRef).toBe(normalizedExpectedRef);

  Logger.success(`Activated group confirmed via URL ref: ${actualRef}`);
}


}
