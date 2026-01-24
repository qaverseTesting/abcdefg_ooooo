import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string, timeout = 15000) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  }

  async click(locator: Locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click({ timeout });
  }

  /* ============================
     STABLE ENTERPRISE INPUT
  ============================ */
  async stableFill(locator: Locator, value: string) {
    await locator.waitFor({ state: 'visible' });

    // Clear using real keyboard (safe)
    await locator.click();
    await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await locator.press('Backspace');

    // Type sequentially (non-deprecated)
    await locator.pressSequentially(value, { delay: 80 });

    // Hard assertion — prevents silent failures
    await expect(locator).toHaveValue(value, { timeout: 5000 });
  }

  async expectVisible(locator: Locator, message?: string) {
    await expect(locator, message).toBeVisible();
  }

   async robustClick(locator: Locator, timeout = 15_000): Promise<void> {
    // 1️⃣ Wait until element exists in DOM
    await locator.waitFor({ state: 'attached', timeout });

    // 2️⃣ Wait until it becomes enabled (if applicable)
    try {
      await expect(locator).toBeEnabled({ timeout: timeout / 2 });
    } catch {
      // Some buttons never toggle disabled state — safe to continue
    }

    // 3️⃣ Try normal click → fallback to force
    try {
      await locator.click({ timeout });
    } catch {
      await locator.click({ force: true, timeout });
    }
  }
}
