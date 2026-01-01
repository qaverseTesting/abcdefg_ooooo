import { Page } from '@playwright/test';

export class Wait {
  static async forNetworkIdle(page: Page) {
    await page.waitForLoadState('networkidle');
  }
}
