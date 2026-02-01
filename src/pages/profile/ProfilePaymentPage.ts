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




async selectFreePaymentAndSave(): Promise<void> {
  Logger.step('Selecting FREE payment type');

  // 🔥 Ensure payment section actually exists
  await expect(
    this.page.getByRole('heading', { name: /payment settings/i })
  ).toBeVisible({ timeout: 15_000 });

  // Sometimes CI renders slower inside tabs/accordions
  await this.page.waitForTimeout(500);

  // Wait for dropdown OR detect missing section
  const dropdown = this.paymentTypeDropdown;

  if (!(await dropdown.isVisible().catch(() => false))) {
    Logger.error('Payment type dropdown not visible. Dumping page state...');

    console.log('URL:', this.page.url());
    console.log('Visible text:', await this.page.locator('body').innerText());

    throw new Error(
      'Payment section not rendered — likely wrong group selected or group not fully initialized.'
    );
  }

  await dropdown.selectOption('FREE');

  await expect(this.savePaymentSettingsButton).toBeEnabled({ timeout: 70_000 });

  Logger.step('Saving payment settings');

  const successToast = this.page.getByText(/payment type set successfully/i);

  await Promise.all([
    successToast.waitFor({ state: 'visible', timeout: 15_000 }),
    this.savePaymentSettingsButton.click(),
  ]);

  Logger.success('Payment type saved successfully');
}

}
