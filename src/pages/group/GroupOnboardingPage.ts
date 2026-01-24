import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class GroupOnboardingPage extends BasePage {
  private readonly skipForNowButton: Locator;

  constructor(page: Page) {
    super(page);
    this.skipForNowButton = page.getByRole('button', { name: 'Skip for now' });
  }

  /**
   * Skips onboarding ONLY if it is present.
   * Safe to call in all environments (local / CI).
   */
  async skipOnboardingIfPresent(): Promise<void> {
    Logger.step('Checking if onboarding screen is present');

    const isPresent = await this.skipForNowButton
      .waitFor({ state: 'attached', timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    if (!isPresent) {
      Logger.info('Onboarding not shown — continuing flow');
      return;
    }

    Logger.step('Skipping onboarding');
    await this.robustClick(this.skipForNowButton);

    Logger.success('Onboarding skipped');
  }

  /**
   * 🚫 DEPRECATED
   * Kept only to avoid accidental usage.
   * Redirects to safe implementation.
   */
  async skipOnboarding(): Promise<void> {
    await this.skipOnboardingIfPresent();
  }
}
