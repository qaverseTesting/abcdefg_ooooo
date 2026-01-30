// src/pages/dashboard/DashboardPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../config/urls';
import { Logger } from '../../utils/Logger';
import { Assertions } from '../../utils/Assertions';
import { Wait } from '../../utils/Wait';
import { GroupListSection } from './GroupListSection';
import { MyGroupsPage } from './MyGroupsPage';

export class DashboardPage extends BasePage {
  private readonly startGroupLink: Locator;
  private readonly findSupportGroupButton: Locator;
  private readonly searchInput: Locator;
  private readonly noGroupsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.startGroupLink = page.getByRole('link', { name: 'Start a Group' });
    this.findSupportGroupButton = page.getByRole('button', { name: 'Find a support group' });
    this.searchInput = page.getByPlaceholder('Search support groups...');
    this.noGroupsMessage = page.getByText("We're sorry — this group doesn't exist yet.");
  }

  async open(): Promise<void> {
    Logger.step('Opening dashboard');
    await this.page.goto(URLS.DASHBOARD);
  }

  // DO NOT REMOVE — AUTH DEPENDENCY
  async verifyDashboardLoaded(): Promise<void> {
    await Assertions.urlContains(this.page, URLS.DASHBOARD);
    Logger.success('Login successful');
    await Wait.pause(this.page, 10_000);
  }


  async clickStartGroup(): Promise<void> {
    Logger.step('Clicking on Start a Group');
    await Wait.forVisible(this.startGroupLink);
    await this.startGroupLink.click();
  }

  async clickFindSupportGroup(): Promise<void> {
    Logger.step('Clicking on Find a support group');
    await Wait.forVisible(this.findSupportGroupButton);
    await this.findSupportGroupButton.click();
  }

  async searchGroup(groupName: string): Promise<void> {
    Logger.step(`Searching for group: ${groupName}`);
    await this.stableFill(this.searchInput, groupName);
    // Add a small pause for filter to apply
    await Wait.pause(this.page, 1000);
  }

  async verifyGroupFound(groupName: string): Promise<void> {
    Logger.step(`Verifying group "${groupName}" is visible in results`);
    const groupCard = this.page.getByTestId('group-card').filter({ hasText: groupName });
    await this.expectVisible(groupCard, `Group "${groupName}" should be visible`);
  }

  async verifyNoGroupsMessageHidden(): Promise<void> {
    Logger.step('Verifying empty state message is hidden');
    await expect(this.noGroupsMessage).not.toBeVisible();
  }

}
