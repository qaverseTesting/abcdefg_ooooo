import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class ProfilePaymentPage extends BasePage {
  private readonly groupSwitcherButton: Locator;

  // 🔹 Payment section locators (restored)
  private readonly paymentTypeDropdown: Locator;
  private readonly savePaymentSettingsButton: Locator;
  private readonly successToast: Locator;

  constructor(page: Page) {
    super(page);

    // Scope to profile payments content only
    const profileContent = page.locator('div.css-1fkxq70');

    this.groupSwitcherButton = profileContent.locator(
      'button.chakra-menu__menu-button'
    );

    // Payment controls
    this.paymentTypeDropdown = page.locator('select[name="paymentType"]');
    this.savePaymentSettingsButton = page.getByRole('button', {
      name: 'Save Payment Settings',
    });

    // Success message
    this.successToast = page.getByText(/payment type set successfully/i);
  }

  /** Get menu linked to this button using aria-controls */
  private async getGroupMenu(): Promise<Locator> {
    const menuId = await this.groupSwitcherButton.getAttribute('aria-controls');
    return this.page.locator(`[id="${menuId}"]`);
  }

  async openProfilePaymentPage(): Promise<void> {
    Logger.step('Opening Profile → Payments page');

    await this.page.goto('/user/profile/payments', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });

    await expect(this.groupSwitcherButton).toBeVisible({ timeout: 30_000 });

    Logger.success('Profile Payments page ready');
  }

  async selectGroup(groupName: string): Promise<void> {
    Logger.step(`Selecting group: ${groupName}`);

    const label = this.groupSwitcherButton.locator('span').first();

    const current = (await label.textContent())?.trim();
    if (current === groupName) {
      Logger.info(`Group already selected: ${groupName}`);
      return;
    }

    await this.groupSwitcherButton.click();

    const menu = await this.getGroupMenu();
    await expect(menu).toBeVisible();

    const option = menu.getByRole('menuitem', {
      name: groupName,
      exact: true,
    });

    await option.scrollIntoViewIfNeeded();

    await Promise.all([
      menu.waitFor({ state: 'hidden' }),
      option.click(),
    ]);

    await expect(label).toHaveText(groupName, { timeout: 10_000 });

    Logger.success(`Group switched successfully to: ${groupName}`);
  }

  async selectFreePaymentAndSave(): Promise<void> {
    Logger.step('Selecting FREE payment type');

    await this.paymentTypeDropdown.waitFor({ state: 'visible' });
    await this.paymentTypeDropdown.selectOption('FREE');

    await expect(this.savePaymentSettingsButton).toBeEnabled({ timeout: 70_000 });

    Logger.step('Saving payment settings');

    // 🔥 Start waiting for toast BEFORE clicking (prevents race condition)
    await Promise.all([
      this.savePaymentSettingsButton.click(),
      expect(this.successToast).toBeVisible({ timeout: 15_000 }),
    ]);

    Logger.success('Payment type saved successfully (success message visible)');
  }
}
