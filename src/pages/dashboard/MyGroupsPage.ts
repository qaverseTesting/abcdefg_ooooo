// src/pages/dashboard/MyGroupsPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';
import { Wait } from '../../utils/Wait';
import { URLS } from '../../config/urls';
import { ChatPage } from '../chat/ChatPage';
import { RuntimeStore } from '../../utils/RuntimeStore';

/**
 * Result returned when searching for an inactive group
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
   * Opens the saved group (from RuntimeStore) and determines
   * whether Create Session is supported.
   *
   * Loop behavior:
   * - Iterates through all group cards
   * - Stops immediately once the saved group is found
   * - Returns false for unsupported group states
   */
  async openSavedGroupSupportingCreateSession(): Promise<boolean> {
    const targetGroupName = RuntimeStore.getGroupName();

    Logger.step(
      `Searching for saved group to create session: ${targetGroupName}`
    );

    await this.openMyGroups(true);

    const count = await this.groupCards.count();
    Logger.info(`Total groups detected: ${count}`);

    for (let i = 0; i < count; i++) {
      const card = this.groupCards.nth(i);

      if (!(await card.isVisible().catch(() => false))) continue;

      const snapshot = (await card.innerText().catch(() => '')).trim();

      // Continue until the saved group is found
      if (!snapshot.includes(targetGroupName)) continue;

      Logger.success(`Saved group matched: ${targetGroupName}`);

      // Inactive groups cannot create sessions
      if (
        await card
          .getByText(/activate your group/i)
          .isVisible()
          .catch(() => false)
      ) {
        Logger.warn(
          'Saved group is inactive and does not support Create Session'
        );
        return false;
      }

      // Interest-only groups cannot create sessions
      if (
        await card
          .getByText(/i'm interested/i)
          .isVisible()
          .catch(() => false)
      ) {
        Logger.warn(
          'Saved group is interest-only and does not support Create Session'
        );
        return false;
      }

      // Paid groups cannot create sessions
      const isPaidGroup = await card
        .locator('svg circle + line + line')
        .isVisible()
        .catch(() => false);

      if (isPaidGroup) {
        Logger.warn('Saved group is paid and does not support Create Session');
        return false;
      }

      Logger.step('Opening saved group chat');
      const chatPage = new ChatPage(this.page);

      await card.scrollIntoViewIfNeeded();
      await card.click();

      const opened = await chatPage.openCreateSessionFromChatMenu();

      if (opened) {
        Logger.success(
          'Create Session modal successfully opened for saved group'
        );
        return true;
      }

      Logger.warn('Saved group does not expose Create Session action');
      return false;
    }

    Logger.warn('Saved group was not found in My Groups listing');
    return false;
  }

  /**
   * Navigates to My Groups page and waits for group cards to load.
   */
  private async openMyGroups(initial = false): Promise<void> {
    Logger.step('Navigating to My Groups page');

    await this.page.goto(URLS.MYGROUP, {
      waitUntil: 'domcontentloaded',
    });

    if (initial) {
      Logger.step('Waiting for group cards to render');
      await this.groupCards.first().waitFor({
        state: 'visible',
        timeout: 15_000,
      });
    }

    await this.page.waitForTimeout(500);
  }

  /**
   * Fallback logic to locate any group that supports Create Session.
   * Acts as a single source of truth for dynamic group selection.
   */
  async openAnyGroupSupportingCreateSession(): Promise<boolean> {
    await this.openMyGroups(true);

    const visitedGroups = new Set<string>();
    const MAX_ATTEMPTS = 15;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const count = await this.groupCards.count();
      Logger.info(`Scan ${attempt + 1}: ${count} groups available`);

      let progressed = false;

      for (let i = 0; i < count; i++) {
        const card = this.groupCards.nth(i);

        if (!(await card.isVisible().catch(() => false))) continue;

        const snapshot = (await card.innerText().catch(() => '')).trim();
        if (!snapshot || visitedGroups.has(snapshot)) continue;

        visitedGroups.add(snapshot);
        progressed = true;

        // Skip inactive groups
        if (
          await card
            .getByText(/activate your group/i)
            .isVisible()
            .catch(() => false)
        ) {
          Logger.info('Inactive group detected and skipped');
          continue;
        }

        // Skip interest-only groups
        if (
          await card
            .getByText(/i'm interested/i)
            .isVisible()
            .catch(() => false)
        ) {
          Logger.info('Interest-only group detected and skipped');
          continue;
        }

        // Skip paid groups
        const isPaidGroup = await card
          .locator('svg circle + line + line')
          .isVisible()
          .catch(() => false);

        if (isPaidGroup) {
          Logger.info('Paid group detected and skipped');
          continue;
        }

        Logger.step(`Opening group chat: ${snapshot}`);
        await card.scrollIntoViewIfNeeded();
        await card.click();
        await Wait.pause(this.page, 5_000);

        const chatPage = new ChatPage(this.page);
        const opened = await chatPage.openCreateSessionFromChatMenu();

        if (opened) {
          Logger.success('Create Session modal opened successfully');
          return true;
        }

        Logger.warn(
          'Create Session not supported for this group, returning to My Groups'
        );
        await this.openMyGroups(true);
        break;
      }

      if (!progressed) {
        Logger.warn('No additional groups left to evaluate');
        break;
      }
    }

    Logger.warn('No group found that supports Create Session');
    return false;
  }

  /**
   * Finds an inactive group and attempts to navigate to its
   * activation or payment page.
   */
  async openInactiveGroupAndRedirectToPayment(): Promise<InactiveGroupResult> {
    await this.openMyGroups(true);

    const visitedGroups = new Set<string>();
    const MAX_ATTEMPTS = 15;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const count = await this.groupCards.count();
      Logger.info(`Scan ${attempt + 1}: ${count} groups available`);

      let progressed = false;

      for (let i = 0; i < count; i++) {
        const card = this.groupCards.nth(i);

        if (!(await card.isVisible().catch(() => false))) continue;

        const snapshot = (await card.innerText().catch(() => '')).trim();
        if (!snapshot || visitedGroups.has(snapshot)) continue;

        visitedGroups.add(snapshot);
        progressed = true;

        const isInactive = await card
          .getByText(/activate your group/i)
          .isVisible()
          .catch(() => false);

        if (!isInactive) {
          continue;
        }

        Logger.success(`Inactive group identified: ${snapshot}`);

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
          Logger.success('Activation or payment page detected');
          return { status: 'FOUND', groupName: snapshot };
        }

        Logger.warn(
          'Inactive group selected but activation or payment UI was not detected'
        );
        return { status: 'NOT_FOUND' };
      }

      if (!progressed) {
        Logger.warn('No new inactive groups remaining to evaluate');
        break;
      }
    }

    Logger.warn('No inactive group found for activation');
    return { status: 'NOT_FOUND' };
  }

  /**
   * Attempts to activate a priority inactive group first.
   * Falls back to scanning all inactive groups if needed.
   */
  async openPriorityInactiveGroupAndRedirectToPayment(
    priorityGroupName: string
  ): Promise<InactiveGroupResult> {
    await this.openMyGroups(true);

    const visitedGroups = new Set<string>();
    const MAX_ATTEMPTS = 15;
    let priorityGroupHandled = false;

    // --------------------------------------------------
    // Phase 1: Priority group scan
    // --------------------------------------------------
    Logger.step(`Priority scan initiated for group: ${priorityGroupName}`);

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
        Logger.info('Priority group is already active, falling back to scan');
        break;
      }

      Logger.success('Priority group is inactive, opening activation flow');
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
        Logger.success(
          'Activation or payment page detected for priority group'
        );
        return { status: 'FOUND', groupName: snapshot };
      }

      Logger.warn(
        'Priority group selected but activation or payment UI was not detected'
      );
      return { status: 'NOT_FOUND' };
    }

    if (!priorityGroupHandled) {
      Logger.info('Priority group not found, proceeding with fallback scan');
    }

    // --------------------------------------------------
    // Phase 2: Fallback scan using original logic
    // --------------------------------------------------
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const count = await this.groupCards.count();
      Logger.info(`Scan ${attempt + 1}: ${count} groups available`);

      let progressed = false;

      for (let i = 0; i < count; i++) {
        const card = this.groupCards.nth(i);

        if (!(await card.isVisible().catch(() => false))) continue;

        const snapshot = (await card.innerText().catch(() => '')).trim();
        if (!snapshot || visitedGroups.has(snapshot)) continue;

        visitedGroups.add(snapshot);
        progressed = true;

        const isInactive = await card
          .getByText(/activate your group/i)
          .isVisible()
          .catch(() => false);

        if (!isInactive) {
          continue;
        }

        Logger.success(`Inactive group found during fallback scan: ${snapshot}`);

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
          Logger.success('Activation or payment page detected');
          return { status: 'FOUND', groupName: snapshot };
        }

        Logger.warn(
          'Inactive group selected but activation or payment UI was not detected'
        );
        return { status: 'NOT_FOUND' };
      }

      if (!progressed) {
        Logger.warn('No additional inactive groups left to evaluate');
        break;
      }
    }

    Logger.warn('No inactive group found for activation');
    return { status: 'NOT_FOUND' };
  }
}
