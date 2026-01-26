import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string, timeout = 15000) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  }

  /* ============================
     🖱 BASIC CLICK
  ============================ */
  async click(locator: Locator, timeout = 10_000) {
    await locator.waitFor({ state: 'attached', timeout });
    await locator.click({ timeout });
  }

  /* ============================
     🚀 ROBUST ENTERPRISE CLICK
     Handles overlays, scrolling,
     animation, retry logic
  ============================ */
  async robustClick(locator: Locator, timeout = 15_000) {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.scrollIntoViewIfNeeded();

    try {
      await locator.click({ timeout });
    } catch {
      // fallback if element is covered
      await this.page.waitForTimeout(300);
      await locator.click({ force: true, timeout });
    }
  }

  async waitForAttached(locator: Locator, timeout = 10000) {
    await locator.waitFor({ state: 'attached', timeout });
  }

  /* ============================
     🔐 STABLE ENTERPRISE INPUT
  ============================ */
  async stableFill(locator: Locator, value: string) {
    await locator.waitFor({ state: 'attached' });

    await locator.click();
    await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await locator.press('Backspace');

    await locator.pressSequentially(value, { delay: 80 });

    await expect(locator).toHaveValue(value, { timeout: 5000 });
  }

  async expectVisible(locator: Locator, message?: string) {
    await expect(locator, message).toBeVisible();
  }
}
