// src/pages/profile/ProfilePaymentPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class ProfilePaymentPage extends BasePage {
  private readonly paymentTypeSelect: Locator;
  private readonly setGroupPaymentTypeText: Locator;
  private readonly groupDropdown: Locator;

  constructor(page: Page) {
    super(page);

    this.groupDropdown = page.getByRole('button');

    // Stable anchor confirming page load
    this.paymentTypeSelect = page.locator(
      'select[name="paymentType"]'
    );

    // UI confirmation text
    this.setGroupPaymentTypeText = page.locator(
      'text=Set Group Payment Type'
    );
  }

  async verifyGroupNameVisible(groupName: string): Promise<void> {
    Logger.assertion(`Verifying group name - ${groupName} - is visible`);

    const groupNameButton = this.page
      .locator('button')
      .filter({
        has: this.page.locator('span', { hasText: groupName }),
      });

    await expect(
      groupNameButton,
      `Group name - ${groupName} - should be visible in group dropdown`
    ).toBeVisible();
  }

  /**
   * Wait for Profile → Payments page after successful activation
   */
  async waitForProfilePaymentPage(): Promise<void> {
    Logger.step('Waiting for Profile Payments page');

    await this.page.waitForURL(
      /\/user\/profile\/payments\?ref=/,
      { timeout: 20_000 }
    );

    await expect(this.paymentTypeSelect).toBeVisible({
      timeout: 20_000,
    });

    await expect(this.setGroupPaymentTypeText).toBeVisible({
      timeout: 20_000,
    });

    Logger.success(
      'Profile Payments page loaded and "Set Group Payment Type" is visible'
    );
  }

  /**
   * Assert activated group via URL ref parameter
   * Accepts raw UI group name and normalizes it to backend slug
   */
  async assertActivatedGroupRef(expectedGroupName: string): Promise<void> {
    Logger.step('Asserting activated group via URL ref');

    const url = new URL(this.page.url());
    const actualRef = url.searchParams.get('ref');

    expect(actualRef, 'URL ref parameter should exist').toBeTruthy();

    // Normalize UI group name → backend slug
    const normalizedExpectedRef = expectedGroupName
      .toLowerCase()
      .split('\n')[0]        // only "Test Group 1768365180854"
      .trim()
      .replace(/\s+/g, '-');

    Logger.info(`Expected group name (raw): "${expectedGroupName}"`);
    Logger.info(`Expected ref (normalized): "${normalizedExpectedRef}"`);
    Logger.info(`Actual ref (URL): "${actualRef}"`);

    expect(actualRef).toBe(normalizedExpectedRef);

    Logger.success(
      `Activated group confirmed via URL ref: ${actualRef}`
    );
  }
}
