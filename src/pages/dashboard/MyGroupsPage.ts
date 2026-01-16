// src/pages/dashboard/MyGroupsPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';
import { Wait } from '../../utils/Wait';
import { URLS } from '../../config/urls';
import { ChatPage } from '../chat/ChatPage';

/**
 * Result of searching for an inactive group
 */
export type InactiveGroupResult =
  | { status: 'FOUND'; groupName: string }
  | { status: 'NOT_FOUND' };

export class MyGroupsPage extends BasePage {
  private readonly groupCards: Locator;

  constructor(page: Page) {
    super(page);

    this.groupCards = page.locator('[data-testid="group-card"]');
  }

  /**
   * Navigates safely to My Groups page
   */
  private async openMyGroups(initial = false): Promise<void> {
    Logger.step('Navigating to My Groups');

    await this.page.goto(URLS.MYGROUP, {
      waitUntil: 'domcontentloaded',
    });

    if (initial) {
      await this.groupCards.first().waitFor({
        state: 'visible',
        timeout: 15_000,
      });
    }

    await this.page.waitForTimeout(500);
  }

  /**
   * SINGLE SOURCE OF TRUTH
   * Finds a group that supports Create Session
   */
  async openAnyGroupSupportingCreateSession(): Promise<boolean> {
    await this.openMyGroups(true);

    const visitedGroups = new Set<string>();
    const MAX_ATTEMPTS = 15;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const count = await this.groupCards.count();
      Logger.info(`Scan ${attempt + 1}: ${count} groups found`);

      let progressed = false;

      for (let i = 0; i < count; i++) {
        const card = this.groupCards.nth(i);

        if (!(await card.isVisible().catch(() => false))) continue;

        const snapshot = (await card.innerText().catch(() => '')).trim();
        if (!snapshot || visitedGroups.has(snapshot)) continue;

        visitedGroups.add(snapshot);
        progressed = true;

        Logger.step(`Evaluating group: ${snapshot}`);

        //  Inactive
        if (await card.getByText(/activate your group/i).isVisible().catch(() => false)) {
          Logger.info('Inactive group → skipped');
          continue;
        }

        //  Interest-only
        if (await card.getByText(/i'm interested/i).isVisible().catch(() => false)) {
          Logger.info('Interest-only group → skipped');
          continue;
        }

        //  Paid
        const isPaidGroup = await card
          .locator('svg circle + line + line')
          .isVisible()
          .catch(() => false);

        if (isPaidGroup) {
          Logger.info('Paid group → skipped');
          continue;
        }

        await card.scrollIntoViewIfNeeded();
        await card.click();
        await Wait.pause(this.page, 10_000);

        const chatPage = new ChatPage(this.page);
        const opened = await chatPage.tryOpenCreateSession();

        if (opened) {
          Logger.success('Create Session modal opened');
          return true;
        }

        Logger.warn('Create Session not supported → returning to My Groups');
        await this.openMyGroups(true);
        break;
      }

      if (!progressed) {
        Logger.warn('No new groups left to evaluate');
        break;
      }
    }

    Logger.warn('No subscribed group supports Create Session');
    return false;
  }

  /**
     * Finds an inactive group and navigates to activation / payment page.
     * Returns FOUND or NOT_FOUND instead of throwing.
     */
  async openInactiveGroupAndRedirectToPayment(): Promise<InactiveGroupResult> {
    await this.openMyGroups(true);

    const visitedGroups = new Set<string>();
    const MAX_ATTEMPTS = 15;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const count = await this.groupCards.count();
      Logger.info(`Scan ${attempt + 1}: ${count} groups found`);

      let progressed = false;

      for (let i = 0; i < count; i++) {
        const card = this.groupCards.nth(i);

        if (!(await card.isVisible().catch(() => false))) continue;

        const snapshot = (await card.innerText().catch(() => '')).trim();
        if (!snapshot || visitedGroups.has(snapshot)) continue;

        visitedGroups.add(snapshot);
        progressed = true;

        Logger.step(`Evaluating group: ${snapshot}`);

        const isInactive = await card
          .getByText(/activate your group/i)
          .isVisible()
          .catch(() => false);

        if (!isInactive) {
          Logger.info('Not an inactive group → skipped');
          continue;
        }

        Logger.success(`Inactive group found: ${snapshot}`);

        await card.scrollIntoViewIfNeeded();
        await card.click();

        const activated = await Promise.race([
          this.page.locator('#payment-element').waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false),
          this.page.getByRole('button', { name: /pay and activate group/i }).waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false),
          this.page.waitForURL(/activate|subscription|payment/i, { timeout: 15_000 }).then(() => true).catch(() => false),
        ]);

        if (activated) {
          Logger.success('Activation / Payment page detected');
          return { status: 'FOUND', groupName: snapshot };
        }

        Logger.warn('Inactive group clicked but activation UI not detected');
        return { status: 'NOT_FOUND' };
      }

      if (!progressed) {
        Logger.warn('No new groups left to evaluate');
        break;
      }
    }

    Logger.warn('No inactive group found for activation');
    return { status: 'NOT_FOUND' };
  }

}
