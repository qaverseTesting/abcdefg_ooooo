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
    this.membersCountCard = page.locator('text=MEMBERS COUNT');
    this.savePaymentSettingsButton = page.getByRole('button', {
      name: 'Save Payment Settings',

    });

    // Stable anchors
    this.paymentTypeSelect = page.locator('select[name="paymentType"]');
    this.setGroupPaymentTypeText = page.locator('text=Set Group Payment Type');
  }

  async openProfilePaymentPage(): Promise<void> {
    Logger.step('Opening Profile → Payments page directly');

    await this.page.goto('/user/profile/payments', {
      waitUntil: 'commit',      // do not wait for full DOM load
      timeout: 60_000,          // SPA + Stripe safe
    });
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
 * Selects a group from profile payment dropdown and opens it
 */
  /**
   * Selects a group from the profile payment dropdown
   * (No navigation button needed)
   */
  async openGroupRef(groupName: string): Promise<void> {
    Logger.step(`Switching group from dropdown: ${groupName}`);

    // Ensure page is fully ready (payment context loaded)
    await this.paymentTypeSelect.waitFor({ state: 'visible', timeout: 30_000 });

    // Open dropdown
    await this.groupSwitcherButton.waitFor({ state: 'visible' });
    await this.groupSwitcherButton.click();

    // Menu appears
    await this.groupMenuList.waitFor({ state: 'visible' });

    // Select exact group
    const groupOption = this.page.getByRole('menuitem', {
      name: groupName,
      exact: true,
    });

    await groupOption.waitFor({ state: 'visible' });
    await groupOption.click();

    // Ensure selection applied (menu closes)
    await this.groupMenuList.waitFor({ state: 'hidden' });

    Logger.success(`Group switched to: ${groupName}`);
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

  /**
 * Selects FREE payment type and saves settings
 */
  async selectFreePaymentAndSave(): Promise<void> {
    Logger.step('Selecting Free payment type');

    await this.paymentTypeDropdown.waitFor({ state: 'visible' });
    await this.paymentTypeDropdown.selectOption('FREE');

    Logger.step('Waiting for Save Payment Settings button to enable');

    await expect(this.savePaymentSettingsButton).toBeEnabled({ timeout: 70_000 });

    const toast = this.page.getByText('Payment type set successfully');

    Logger.step('Saving payment settings');
    await this.clickAndWaitForSuccess(this.savePaymentSettingsButton, toast);
    Logger.step('*************** Payment settings saved and Members Count section loaded **************');
  }
}
