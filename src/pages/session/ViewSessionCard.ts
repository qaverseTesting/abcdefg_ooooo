import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class ViewSessionCard extends BasePage {
  private readonly popupRoot: Locator;
  private readonly sessionTitle: Locator;

  constructor(page: Page) {
    super(page);

    this.popupRoot = page.locator('.chakra-stack.css-a3eubx');
    this.sessionTitle = this.popupRoot.locator('h4');
  }

  async waitForVisible(): Promise<void> {
    Logger.step('Waiting for View Session popup');

    await this.popupRoot.waitFor({
      state: 'visible',
      timeout: 10_000,
    });

    Logger.success('View Session popup visible');
  }

  async expectSessionTitle(expectedTitle: string): Promise<void> {
    Logger.step('Verifying created session title');

    await expect(this.sessionTitle).toHaveText(expectedTitle, {
      timeout: 5_000,
    });

    Logger.success(`Session title matched: "${expectedTitle}"`);
  }
}
