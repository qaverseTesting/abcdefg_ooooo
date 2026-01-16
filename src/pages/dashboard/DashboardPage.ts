// src/pages/dashboard/DashboardPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../config/urls';
import { Logger } from '../../utils/Logger';
import { Assertions } from '../../utils/Assertions';
import { Wait } from '../../utils/Wait';
import { MyGroupsPage } from './MyGroupsPage';

export class DashboardPage extends BasePage {
  private readonly startGroupLink: Locator;


  constructor(page: Page) {
    super(page);
    this.startGroupLink = page.getByRole('link', { name: 'Start a Group' });

  }

  // DO NOT REMOVE — AUTH DEPENDENCY
  async verifyDashboardLoaded(): Promise<void> {
    await Assertions.urlContains(this.page, URLS.DASHBOARD);
    Logger.success('Login successful');
    //await Wait.pause(this.page, 10_000);
  }

  async clickStartGroup(): Promise<void> {
    Logger.step('Clicking on Start a Group');
    await Wait.forVisible(this.startGroupLink);
    await this.startGroupLink.click();
  }

}
