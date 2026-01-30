import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';
import { CreateSessionModal } from '@pages/session/CreateSessionModal';
import { RuntimeStore } from '@utils/RuntimeStore';

export class ChatPage extends BasePage {
  /* =========================================================
   * LOCATORS
   * ========================================================= */

  // Announcement banner displayed at the top of the chat page
  private readonly announcementBanner: Locator;
  private readonly announcementCloseBtn: Locator;

  // Chat page anchors used to confirm correct page and group context
  private readonly chatHeaderGroupName: Locator;
  private readonly chatTopBar: Locator;

  // Button that opens the chat action (kebab) menu
  private readonly chatMenuButton: Locator;

  // Create Session modal elements
  private readonly createSessionModalBody: Locator;
  private readonly createSessionModalHeading: Locator;

  constructor(page: Page) {
    super(page);

    /* ---------- Announcement ---------- */
    this.announcementBanner = page.locator('[data-testid="announceView"]');
    this.announcementCloseBtn = this.announcementBanner.getByRole('button', {
      name: /close/i,
    });

    /* ---------- Chat Page Anchors ---------- */
    // Group name displayed in the chat header
    this.chatHeaderGroupName = page.locator(
      'p.chakra-text.css-722v25'
    );

    // Top bar container that appears only when the chat page is fully loaded
    this.chatTopBar = page.locator('div.css-79elbk');

    /* ---------- Chat Menu ---------- */
    this.chatMenuButton = page.getByRole('button', {
      name: /chat box action menu/i,
    });

    /* ---------- Create Session Modal ---------- */
    this.createSessionModalBody = page.locator('div.chakra-modal__body');
    this.createSessionModalHeading =
      this.createSessionModalBody.getByRole('heading', {
        name: /schedule a session/i,
      });
  }

  /* =========================================================
   * COMMON INTERACTION GUARD
   * Ensures elements are attached, visible, and enabled
   * ========================================================= */
  private async waitUntilInteractable(
    locator: Locator,
    timeout = 20_000
  ): Promise<void> {
    await locator.waitFor({ state: 'attached', timeout });
    await expect(locator).toBeVisible({ timeout });
    await expect(locator).toBeEnabled({ timeout });
  }

  /* =========================================================
   * PAGE STATE ASSERTION
   * Confirms chat page is loaded and correct group is opened
   * ========================================================= */
  private async assertChatPageOpenedCorrectly(): Promise<void> {
    const expectedGroupName = RuntimeStore.getGroupName();

    Logger.step('Verifying chat page has loaded correctly');

    // Validate chat layout is rendered
    await expect(this.chatTopBar).toBeVisible({ timeout: 20_000 });
    Logger.success('Chat page layout is visible');

    // Validate correct group chat is opened
    const groupHeader = this.page.getByText(expectedGroupName, { exact: true });
    await expect(groupHeader.first()).toBeVisible({ timeout: 20_000 });

    Logger.success(
      `Chat page opened for expected group: ${expectedGroupName}`
    );
  }

  /* =========================================================
   * ANNOUNCEMENT HANDLER
   * Closes announcement banner if it blocks interactions
   * ========================================================= */
  private async closeAnnouncementIfExists(): Promise<void> {
    try {
      const appeared = await this.announcementBanner
        .waitFor({ state: 'attached', timeout: 2_000 })
        .then(() => true)
        .catch(() => false);

      if (!appeared) {
        Logger.info('No announcement banner present');
        return;
      }

      Logger.info('Announcement banner detected, attempting to close');

      await this.waitUntilInteractable(this.announcementCloseBtn);
      await this.announcementCloseBtn.click();

      // Ensure banner is fully removed or hidden before continuing
      await Promise.race([
        this.announcementBanner.waitFor({ state: 'detached', timeout: 10_000 }),
        this.announcementBanner.waitFor({ state: 'hidden', timeout: 10_000 }),
      ]);

      Logger.success('Announcement banner closed successfully');
    } catch (err) {
      Logger.warn(`Announcement close skipped due to error: ${err}`);
    }
  }

  /* =========================================================
   * MAIN FLOW
   * Opens Create Session modal from chat action menu
   * ========================================================= */
  async openCreateSessionFromChatMenu(): Promise<CreateSessionModal | null> {
    try {
      Logger.step('Initiating Create Session flow from Chat menu');

      // Step 1: Ensure chat page and group context are correct
      await this.assertChatPageOpenedCorrectly();

      // Step 2: Close announcement banner if present
      await this.closeAnnouncementIfExists();

      // Step 3: Open chat action menu
      await this.waitUntilInteractable(this.chatMenuButton);
      await this.chatMenuButton.click();
      Logger.success('Chat action menu opened');

      // Step 4: Select "Schedule a Session" option
      const scheduleItem = this.page.getByRole('menuitem', {
        name: /schedule a session/i,
      });

      await this.waitUntilInteractable(scheduleItem);
      await scheduleItem.click();
      Logger.success('"Schedule a Session" menu item selected');

      // Step 5: Verify Create Session modal is displayed
      await this.waitUntilInteractable(this.createSessionModalBody);
      await expect(this.createSessionModalHeading).toBeVisible();

      Logger.success('Create Session modal displayed successfully');

      return new CreateSessionModal(this.page);
    } catch (error) {
      Logger.error('Failed to open Create Session from Chat menu', error);

      await this.page.screenshot({
        path: `chat-create-session-failure-${Date.now()}.png`,
        fullPage: true,
      });

      return null;
    }
  }
}
