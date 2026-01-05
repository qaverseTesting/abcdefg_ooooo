import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';
import { Wait } from '../../utils/Wait';

export class GroupOnboardingPage extends BasePage {
  private readonly skipForNowButton: Locator;

  constructor(page: Page) {
    super(page);
    this.skipForNowButton = page.getByRole('button', { name: 'Skip for now' });
  }

  /**
   * Skips onboarding and navigates to group profile
   */
  async skipOnboarding(): Promise<void> {
    Logger.step('Skipping onboarding');
    await Wait.pause(this.page, 20_000);
    await expect(this.skipForNowButton).toBeVisible();
    await this.skipForNowButton.click();
  }
}
