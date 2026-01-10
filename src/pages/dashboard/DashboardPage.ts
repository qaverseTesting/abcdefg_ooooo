// src/pages/dashboard/DashboardPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../config/urls';
import { Logger } from '../../utils/Logger';
import { Assertions } from '../../utils/Assertions';
import { Wait } from '../../utils/Wait';
import { ChatPage } from '../chat/ChatPage';

export class DashboardPage extends BasePage {
  private readonly groupCards: Locator;

  constructor(page: Page) {
    super(page);
    this.groupCards = page.locator('[data-testid="group-card"]');
  }

  // ⚠️ DO NOT REMOVE — AUTH DEPENDENCY
  async verifyDashboardLoaded(): Promise<void> {
    await Assertions.urlContains(this.page, URLS.DASHBOARD);
    Logger.success('Login successful');
    await Wait.pause(this.page, 10_000);
  }

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
   * ✅ FINAL SAFE IMPLEMENTATION
   */
  async openCreateSessionFromAnySubscribedGroup(): Promise<boolean> {
    await this.openMyGroups(true);

    const visitedGroups = new Set<string>();
    const MAX_ATTEMPTS = 15; // ⛑ prevents runaway loops

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const cards = this.page.locator('[data-testid="group-card"]');
      const count = await cards.count();

      Logger.info(`Scan ${attempt + 1}: ${count} group cards found`);

      let progressed = false;

      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);

        if (!(await card.isVisible().catch(() => false))) continue;

        const snapshot = (await card.innerText().catch(() => '')).trim();
        if (!snapshot || visitedGroups.has(snapshot)) continue;

        visitedGroups.add(snapshot);
        progressed = true;

        Logger.step(`Evaluating group: ${snapshot}`);

        // ❌ Skip inactive groups
        if (await card.getByText(/activate your group/i).isVisible().catch(() => false)) {
          Logger.info('Inactive group → skipped');
          continue;
        }

        // ❌ Skip interest-only groups
        if (await card.getByText(/i'm interested/i).isVisible().catch(() => false)) {
          Logger.info('Interest-only group → skipped');
          continue;
        }

        // ❌ Skip paid groups (info-circle icon)
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

        Logger.warn('Create Session not supported → returning to groups');
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
}
