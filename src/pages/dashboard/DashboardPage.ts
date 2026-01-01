import { Page, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class DashboardPage extends BasePage {
  /**
   * Expected dashboard URL after successful login
   * Using `includes` instead of exact match for safety
   */
  private readonly dashboardUrlPath = '/groups';

  constructor(page: Page) {
    super(page);
  }

  /* ---------------------------
     Assertions
  ---------------------------- */

  /**
   * Verifies that the user is successfully redirected
   * to the Dashboard (Groups page) after login
   */
  async verifyDashboardLoaded() {
    await expect(
      this.page,
      'User should be redirected to Dashboard (Groups page)'
    ).toHaveURL(new RegExp(`${this.dashboardUrlPath}$`), {
      timeout: 10_000,
    });
  }
}
