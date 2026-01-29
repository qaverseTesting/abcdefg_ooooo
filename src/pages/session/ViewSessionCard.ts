import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class ViewSessionCard extends BasePage {
  private readonly sessionCard: Locator;
  private readonly sessionTitle: Locator;

  constructor(page: Page, title: string) {
    super(page);

    // 🎯 Card container that contains the session title
    this.sessionCard = page
      .locator('div.chakra-stack')
      .filter({ has: page.getByRole('heading', { level: 4, name: title }) });

    this.sessionTitle = this.sessionCard.getByRole('heading', { level: 4 });
  }

  // =========================================================
  // WAIT FOR SESSION CARD
  // =========================================================
  async waitForVisible(): Promise<void> {
    Logger.step('Waiting for session card to appear');

    await this.sessionCard.waitFor({
      state: 'visible',
      timeout: 15_000, // sessions sometimes render slower
    });

    Logger.success('Session card is visible');
  }

  // =========================================================
  // VERIFY TITLE
  // =========================================================
  async expectSessionTitle(expectedTitle: string): Promise<void> {
    Logger.step(`Validating session title: "${expectedTitle}"`);

    await expect(this.sessionTitle).toHaveText(expectedTitle, {
      timeout: 5_000,
    });

    Logger.success('Session title verified');
  }

  // =========================================================
  // COMBINED ASSERT
  // =========================================================
  async verifySessionCreated(expectedTitle: string): Promise<void> {
    await this.waitForVisible();
    await this.expectSessionTitle(expectedTitle);
  }
}
