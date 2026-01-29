// src/pages/dashboard/MyGroupsPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';
import { Wait } from '../../utils/Wait';
import { URLS } from '../../config/urls';
import { ChatPage } from '../chat/ChatPage';
import { RuntimeStore } from '../../utils/RuntimeStore';

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
 * Opens the saved group (from RuntimeStore) and checks
 * if Create Session is supported.
 *
 * Loop behavior:
 * - Iterate until saved group is found
 * - Stop immediately when found
 * - Continue if not matched
 */
  async openSavedGroupSupportingCreateSession(): Promise<boolean> {
    const targetGroupName = RuntimeStore.getGroupName();

    Logger.step(`Searching for saved group for Create Session: ${targetGroupName}`);

    await this.openMyGroups(true);

    const count = await this.groupCards.count();

    for (let i = 0; i < count; i++) {
      const card = this.groupCards.nth(i);

      if (!(await card.isVisible().catch(() => false))) continue;

      const snapshot = (await card.innerText().catch(() => '')).trim();

      // Skip until saved group is found
      if (!snapshot.includes(targetGroupName)) continue;

      Logger.success(`Saved group found: ${targetGroupName}`);

      // Inactive groups cannot create sessions
      if (
        await card
          .getByText(/activate your group/i)
          .isVisible()
          .catch(() => false)
      ) {
        Logger.warn('Saved group is inactive → cannot create session');
        return false;
      }

      // Interest-only groups cannot create sessions
      if (
        await card
          .getByText(/i'm interested/i)
          .isVisible()
          .catch(() => false)
      ) {
        Logger.warn('Saved group is interest-only → cannot create session');
        return false;
      }

      // ❌ Paid groups cannot create sessions
      const isPaidGroup = await card
        .locator('svg circle + line + line')
        .isVisible()
        .catch(() => false);

      if (isPaidGroup) {
        Logger.warn('Saved group is paid → cannot create session');
        return false;
      }

       const chatPage = new ChatPage(this.page);
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await Wait.pause(this.page, 7_000);

     
      const opened = await chatPage.openCreateSessionFromChatMenu();

      if (opened) {
        Logger.success('Create Session modal opened for saved group');
        return true;
      }

      Logger.warn('Saved group does not support Create Session');
      return false;
    }

    Logger.warn('Saved group not found in My Groups listing');
    return false;
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

        //Logger.step(`Evaluating group: ${snapshot}`);

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
        await Wait.pause(this.page, 5_000);

        const chatPage = new ChatPage(this.page);
        const opened = await chatPage.openCreateSessionFromChatMenu();

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
    //const targetGroupName = RuntimeStore.getGroupName();

    await this.openMyGroups(true);
    const count = await this.groupCards.count();

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

        // Continue loop if this is not our saved group
        //if (!snapshot.includes(targetGroupName)) continue;
        //Logger.success(`Saved group found: ${targetGroupName}`);

        if (!snapshot || visitedGroups.has(snapshot)) continue;

        visitedGroups.add(snapshot);
        progressed = true;

        //Logger.step(`Evaluating group: ${snapshot}`);

        const isInactive = await card
          .getByText(/activate your group/i)
          .isVisible()
          .catch(() => false);

        if (!isInactive) {
         // Logger.info('Not an inactive group → skipped');
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

  async openPriorityInactiveGroupAndRedirectToPayment(
    priorityGroupName: string
  ): Promise<InactiveGroupResult> {

    await this.openMyGroups(true);

    const visitedGroups = new Set<string>();
    const MAX_ATTEMPTS = 15;

    let priorityGroupHandled = false;

    // ==================================================
    // PHASE 1: Priority group scan (safe)
    // ==================================================
    Logger.step(`Priority scan for group: ${priorityGroupName}`);

    const initialCount = await this.groupCards.count();

    for (let i = 0; i < initialCount; i++) {
      const card = this.groupCards.nth(i);

      if (!(await card.isVisible().catch(() => false))) continue;

      const snapshot = (await card.innerText().catch(() => '')).trim();
      if (!snapshot || !snapshot.includes(priorityGroupName)) continue;

      priorityGroupHandled = true;
      visitedGroups.add(snapshot);

      Logger.success(`Priority group found: ${snapshot}`);

      const isInactive = await card
        .getByText(/activate your group/i)
        .isVisible()
        .catch(() => false);

      if (!isInactive) {
        Logger.info('Priority group is active → fallback scan');
        break;
      }

      Logger.success('Priority group is inactive → opening');
      await card.scrollIntoViewIfNeeded();
      await card.click();

      const activated = await Promise.race([
        this.page
          .locator('#payment-element')
          .waitFor({ state: 'visible', timeout: 15_000 })
          .then(() => true)
          .catch(() => false),

        this.page
          .getByRole('button', { name: /pay and activate group/i })
          .waitFor({ state: 'visible', timeout: 15_000 })
          .then(() => true)
          .catch(() => false),

        this.page
          .waitForURL(/activate|subscription|payment/i, { timeout: 15_000 })
          .then(() => true)
          .catch(() => false),
      ]);

      if (activated) {
        Logger.success('Activation / Payment page detected for priority group');
        return { status: 'FOUND', groupName: snapshot };
      }

      Logger.warn('Priority group clicked but activation UI not detected');
      return { status: 'NOT_FOUND' };
    }

    if (!priorityGroupHandled) {
      Logger.info('Priority group not found → fallback scan');
    }

    // ==================================================
    // PHASE 2: ORIGINAL WORKING LOGIC (UNCHANGED)
    // ==================================================
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

        //Logger.step(`Evaluating group: ${snapshot}`);

        const isInactive = await card
          .getByText(/activate your group/i)
          .isVisible()
          .catch(() => false);

        if (!isInactive) {
          //Logger.info('Not an inactive group → skipped');
          continue;
        }

        Logger.success(`Inactive group found: ${snapshot}`);
        await card.scrollIntoViewIfNeeded();
        await card.click();

        const activated = await Promise.race([
          this.page
            .locator('#payment-element')
            .waitFor({ state: 'visible', timeout: 15_000 })
            .then(() => true)
            .catch(() => false),

          this.page
            .getByRole('button', { name: /pay and activate group/i })
            .waitFor({ state: 'visible', timeout: 15_000 })
            .then(() => true)
            .catch(() => false),

          this.page
            .waitForURL(/activate|subscription|payment/i, { timeout: 15_000 })
            .then(() => true)
            .catch(() => false),
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

    // ==================================================
    // FINAL GUARANTEED RETURN (TS SAFE)
    // ==================================================
    Logger.warn('No inactive group found for activation');
    return { status: 'NOT_FOUND' };
  }


}