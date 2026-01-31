import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class ProfilePaymentPage extends BasePage {
  private readonly groupSwitcherButton: Locator;

  constructor(page: Page) {
    super(page);

    // Scope to profile payments content only
    const profileContent = page.locator('div.css-1fkxq70');

    this.groupSwitcherButton = profileContent.locator(
      'button.chakra-menu__menu-button'
    );
  }

  /** Get menu linked to this button using aria-controls (no CSS id selector) */
  private async getGroupMenu(): Promise<Locator> {
    const menuId = await this.groupSwitcherButton.getAttribute('aria-controls');

    // Use attribute selector (handles special chars safely)
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

    // Open dropdown
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

    await expect(label).toHaveText(groupName, { timeout: 40_000 });

    Logger.success(`Group switched successfully to: ${groupName}`);
  }
}
