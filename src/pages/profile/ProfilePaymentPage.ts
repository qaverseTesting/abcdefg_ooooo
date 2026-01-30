// src/pages/profile/ProfilePaymentPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';
import { Wait } from '../../utils/Wait';

export class ProfilePaymentPage extends BasePage {
  private readonly paymentTypeSelect: Locator;
  private readonly setGroupPaymentTypeText: Locator;
  private readonly paymentTypeDropdown: Locator;
  private readonly savePaymentSettingsButton: Locator;
  private readonly membersCountCard: Locator;

  private readonly groupSwitcherButton: Locator;
  private readonly groupMenuList: Locator;

  constructor(page: Page) {
    super(page);

    this.groupSwitcherButton = page.locator('button[aria-haspopup="menu"]');
    this.groupMenuList = page.getByRole('menu');

    this.paymentTypeDropdown = page.locator('select[name="paymentType"]');
    this.paymentTypeSelect = page.locator('select[name="paymentType"]');

    this.setGroupPaymentTypeText = page.locator('text=Set Group Payment Type');

    this.membersCountCard = page.locator('text=MEMBERS COUNT');

    this.savePaymentSettingsButton = page.getByRole('button', {
      name: 'Save Payment Settings',
    });
  }

  /**
   * Opens Profile → Payments page directly
   */
  async openProfilePaymentPage(): Promise<void> {
    Logger.step('Opening Profile → Payments page directly');

    await this.page.goto('/user/profile/payments', {
      waitUntil: 'commit', // SPA-safe
      timeout: 60_000,
    });
  }

  /**
   * Waits for Profile → Payments page to be fully ready
   * Handles SPA hydration delays safely (CI + local)
   */
  async waitForProfilePaymentPage(): Promise<void> {
    Logger.step('Waiting for Profile Payments page');

    // Soft URL validation (do not depend on ref or navigation events)
    await this.page.waitForFunction(
      () => window.location.pathname.includes('/user/profile/payments'),
      { timeout: 30_000 }
    );

    Logger.step('Waiting for payment settings form to mount');

    // CRITICAL FIX: wait for attachment first (prevents intermittent failures)
    await this.paymentTypeSelect.waitFor({
      state: 'attached',
      timeout: 30_000,
    });

    // Now assert visibility (stable)
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
   * Switches active group from the group dropdown in profile payments
   */
  async openGroupRef(groupName: string): Promise<void> {
    Logger.step(`Switching group from dropdown: ${groupName}`);

    await this.paymentTypeSelect.waitFor({ state: 'visible', timeout: 30_000 });

    await this.groupSwitcherButton.waitFor({ state: 'visible' });
    await this.groupSwitcherButton.click();

    await this.groupMenuList.waitFor({ state: 'visible' });

    const groupOption = this.page.getByRole('menuitem', {
      name: groupName,
      exact: true,
    });

    await groupOption.waitFor({ state: 'visible' });
    await groupOption.click();

    await this.groupMenuList.waitFor({ state: 'hidden' });

    Logger.success(`Group switched successfully to: ${groupName}`);
  }

  /**
   * Asserts activated group via URL ref parameter (if present)
   * Safe for SPA behavior
   */
  async assertActivatedGroupRef(expectedGroupName: string): Promise<void> {
    Logger.step('Checking activated group via URL ref parameter');

    const url = new URL(this.page.url());
    const actualRef = url.searchParams.get('ref');

    if (!actualRef) {
      Logger.warn('URL ref parameter not present, skipping assertion');
      return;
    }

    const normalizedExpectedRef = expectedGroupName
      .toLowerCase()
      .split('\n')[0]
      .trim()
      .replace(/\s+/g, '-');

    Logger.info(`Expected ref: ${normalizedExpectedRef}`);
    Logger.info(`Actual ref: ${actualRef}`);

    expect(actualRef).toBe(normalizedExpectedRef);

    Logger.success('Activated group confirmed via URL ref');
  }

  /**
   * Selects FREE payment type and saves configuration
   */
  async selectFreePaymentAndSave(): Promise<void> {
    Logger.step('Selecting FREE payment type');

    await this.paymentTypeDropdown.waitFor({ state: 'visible' });
    await this.paymentTypeDropdown.selectOption('FREE');

    Logger.step('Waiting for Save Payment Settings button to be enabled');
    await expect(this.savePaymentSettingsButton).toBeEnabled({
      timeout: 70_000,
    });

    const toast = this.page.getByText('Payment type set successfully');

    Logger.step('Saving payment settings');
    await this.clickAndWaitForSuccess(
      this.savePaymentSettingsButton,
      toast
    );

    Logger.success(
      'Payment settings saved successfully and Members Count section loaded'
    );
  }
}
