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
    await expect(menu).toBeVisible({ timeout: 10_000 });

    Logger.step('Selecting group from Chakra virtualized menu');

    const option = menu.getByRole('menuitem', { name: groupName, exact: true });

    // Ensure it exists in DOM (virtualized list handling)
    await expect(option).toHaveCount(1, { timeout: 10_000 });

    // Scroll container so React marks it "in view"
    await menu.evaluate((el, text) => {
      const items = Array.from(el.querySelectorAll('[role="menuitem"]'));
      const target = items.find(i => i.textContent?.trim() === text);
      if (target) target.scrollIntoView({ block: 'center' });
    }, groupName);

    // 🔥 DOM-level click bypasses viewport & overlay issues
    await option.evaluate(el => (el as HTMLElement).click());

    if (current) {
      await expect(label).not.toHaveText(current, { timeout: 10_000 });
    }

    await expect(label).toHaveText(groupName, { timeout: 10_000 });

    Logger.success(`Group switched successfully to: ${groupName}`);
  }

 async selectFreePaymentAndSave(groupName: string): Promise<void> {
  Logger.step('Preparing to configure payment settings');

  const label = this.groupSwitcherButton.locator('span').first();

  // 🧠 Wait until correct group context is active
  await expect(label).toHaveText(groupName, { timeout: 30_000 });

  Logger.step('Group context ready, waiting for payment section');

  // Payment section loads after group context resolves
  await expect(this.paymentTypeDropdown).toBeVisible({ timeout: 30_000 });

  Logger.step('Selecting FREE payment type');
  await this.paymentTypeDropdown.selectOption('FREE');

  await expect(this.savePaymentSettingsButton).toBeEnabled({ timeout: 30_000 });

  const successToast = this.page.getByText(/payment type set successfully/i);

  Logger.step('Saving payment settings');

  await Promise.all([
    successToast.waitFor({ state: 'visible', timeout: 20_000 }),
    this.savePaymentSettingsButton.click(),
  ]);

  Logger.success('Payment type saved successfully');
}

}
