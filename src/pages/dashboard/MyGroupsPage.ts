// src/pages/dashboard/MyGroupsPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';
import { Wait } from '../../utils/Wait';

/**
 * MyGroupsPage
 * ------------
 * Encapsulates behavior related to
 * the "My Groups" dashboard section.
 *
 * Responsibilities:
 * - Open My Groups page
 * - Iterate through active groups
 * - Find a group that supports session creation
 */
export class MyGroupsPage extends BasePage {
  /* ---------------------------
     Locators
  ---------------------------- */

  /** Navigation link to My Groups */
  private readonly myGroupsLink: Locator;

  /**
   * Represents all active group cards.
   * Each group card contains text ending with "Members"
   * Example: "Test Group 5 Members"
   */
  private readonly activeGroups: Locator;

  constructor(page: Page) {
    super(page);

    this.myGroupsLink = page.getByRole('link', { name: 'My Groups' });

    this.activeGroups = page.locator('div').filter({
      hasText: /Members$/,
    });
  }

  /* ---------------------------
     Actions
  ---------------------------- */

  /**
   * Opens the My Groups page
   * and waits for the content to stabilize
   */

  async open(): Promise<void> {
    await Wait.pause(this.page, 20_000);
    Logger.step('Opening My Groups');

    await this.myGroupsLink.click();
    await Wait.forNetworkIdle(this.page);
  }

  /**
   * Iterates through active groups and opens
   * the first group that contains
   * the "Schedule a session" option.
   *
   * Handles:
   * - Free groups
   * - Paid groups (navigates back safely)
   *
   * Throws:
   * - Error if no valid group is found
   */
  async openFirstGroupWithSessionOption(): Promise<void> {
    Logger.step('Finding group with Schedule a session');

    const count = await this.activeGroups.count();

    for (let i = 0; i < count; i++) {
      // Open group card
      await this.activeGroups.nth(i).click();

      // Check if "Schedule a session" option exists
      const scheduleVisible = await this.page
        .getByRole('menuitem', { name: /Schedule a session/i })
        .isVisible()
        .catch(() => false);

      if (scheduleVisible) {
        Logger.success('Found group with Schedule a session');
        return;
      }

      // If session option not available (e.g., paid group),
      // navigate back to My Groups safely
      await this.page.getByRole('link', { name: 'My Groups' }).click();
      await Wait.forNetworkIdle(this.page);
    }

    // No group supports session creation
    throw new Error('No group found with Schedule a session option');
  }
}
