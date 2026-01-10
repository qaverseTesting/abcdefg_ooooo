import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';  
import { Wait } from '../../utils/Wait'; 

export class GroupProfilePage extends BasePage {
  private readonly groupDropdown: Locator;

  constructor(page: Page) {
    super(page);

    // Dropdown / button showing group name
    this.groupDropdown = page.getByRole('button');
  }

  /**
   * Verifies created group name is visible on profile page
   */
  async verifyGroupNameVisible(groupName: string): Promise<void> {
    Logger.assertion(`Verifying group name - ${groupName} - is visible`);

    const groupNameButton = this.page
      .locator('button')
      .filter({
        has: this.page.locator('span', { hasText: groupName }),
      });

    await expect(
      groupNameButton,
      `Group name - ${groupName} - should be visible in group dropdown`
    ).toBeVisible();
  }
}
