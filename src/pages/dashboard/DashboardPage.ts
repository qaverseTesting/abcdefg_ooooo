import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../config/urls';
import { Wait } from '../../utils/Wait';
import { Logger } from '../../utils/Logger';
import { Assertions } from '../../utils/Assertions';

export class DashboardPage extends BasePage {

  /**
   * Expected dashboard URL after successful login
   * Using `includes` instead of exact match for safety
   */

  private readonly startGroupLink: Locator;

  constructor(page: Page) {
    super(page);
    this.startGroupLink = page.getByRole('link', { name: 'Start a Group' });
  }

  /**
   * Clicks on "Start a Group" from dashboard
   */
  async clickStartGroup() {
    Logger.step('Clicking on Start a Group');
    await Wait.forVisible(this.startGroupLink);
    await this.startGroupLink.click();
  }

  async verifyDashboardLoaded() {
    await Assertions.urlContains(this.page, URLS.DASHBOARD);
    Logger.success('Login successful');
    await Wait.pause(this.page, 10_000);

  }
}
