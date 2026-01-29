import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';
import { CreateSessionModal } from '@pages/session/CreateSessionModal';

export class ChatPage extends BasePage {
  // Announcement banner shown at top of chat page
  private readonly announcementBanner: Locator;

  // Close button inside announcement banner
  private readonly announcementCloseBtn: Locator;

  // Button that opens the Chat action menu (3-dot / kebab menu)
  private readonly chatMenuButton: Locator;

  // Chakra modal body container (used to confirm modal is open)
  private readonly createSessionModalBody: Locator;

  // Heading inside Create Session modal — strong signal modal loaded correctly
  private readonly createSessionModalHeading: Locator;

  constructor(page: Page) {
    super(page);

    // Banner container
    this.announcementBanner = page.locator('[data-testid="announceView"]');

    // Close button inside the banner
    this.announcementCloseBtn = this.announcementBanner.getByRole('button', {
      name: /close/i,
    });

    // Chat action menu button in header
    this.chatMenuButton = page.getByRole('button', {
      name: /chat box action menu/i,
    });

    // Chakra modal body wrapper
    this.createSessionModalBody = page.locator('div.chakra-modal__body');

    // Modal heading to verify correct modal opened
    this.createSessionModalHeading = this.createSessionModalBody.getByRole(
      'heading',
      { name: /schedule a session/i }
    );
  }

  // =========================================================
  // FULL FLOW — OPEN CREATE SESSION FROM CHAT MENU
  // =========================================================
  async openCreateSessionFromChatMenu(): Promise<CreateSessionModal | null> {
    try {
      Logger.step('Opening session creation from Chat Menu');

      // Ensure announcement banner is not blocking clicks
      await this.closeAnnouncementIfExists();

      // 1️⃣ Open Chat Menu
      await this.chatMenuButton.waitFor({ state: 'visible', timeout: 10_000 });
      await this.chatMenuButton.click();

      // Confirm menu actually opened (Chakra sets aria-expanded)
      await expect(this.chatMenuButton).toHaveAttribute('aria-expanded', 'true');

      // 2️⃣ Resolve EXACT menu container using aria-controls linkage
      const menuId = await this.chatMenuButton.getAttribute('aria-controls');
      if (!menuId) throw new Error('aria-controls missing on chat menu button');

      const menu = this.page.locator(`[id="${menuId}"]`);
      await menu.waitFor({ state: 'visible', timeout: 5_000 });

      Logger.success(`Chat menu visible (id=${menuId})`);

      // 3️⃣ Click the menu item using ARIA role (correct for Chakra menus)
      const scheduleItem = menu.getByRole('menuitem', {
        name: /schedule a session/i,
      });

      await scheduleItem.waitFor({ state: 'visible', timeout: 5_000 });

      // Force click avoids rare animation/pointer interception issues
      await scheduleItem.click({ force: true });

      Logger.step('Clicked Schedule a Session menu item');

      // 4️⃣ Wait for Create Session modal to appear
      await this.createSessionModalBody.waitFor({
        state: 'visible',
        timeout: 10_000,
      });

      await this.createSessionModalHeading.waitFor({
        state: 'visible',
        timeout: 5_000,
      });

      Logger.success('Create Session modal opened');

      // Return modal object for next test steps
      return new CreateSessionModal(this.page);
    } catch (error) {
      Logger.error('Failed to open Create Session from Chat menu', error);

      // Screenshot helps debugging flaky UI state
      await this.page.screenshot({ path: 'session-from-menu-failure.png' });

      return null;
    }
  }

  // =========================================================
  // ANNOUNCEMENT HANDLER
  // =========================================================
  /**
   * Closes the announcement banner if it is present.
   * Prevents it from blocking header interactions.
   */
private async closeAnnouncementIfExists(): Promise<void> {
  try {
    const appeared = await this.announcementBanner
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);

    if (!appeared) {
      Logger.info('Announcement banner not present');
      return;
    }

    Logger.info('Closing announcement banner');

    await this.announcementCloseBtn.click({ timeout: 3000 });

    await Promise.race([
      this.announcementBanner.waitFor({ state: 'detached', timeout: 5000 }),
      this.announcementBanner.waitFor({ state: 'hidden', timeout: 5000 }),
    ]).catch(() => this.page.waitForTimeout(500));

    Logger.success('Announcement banner closed');
  } catch (err) {
    Logger.warn(`Announcement close skipped: ${err}`);
  }
}

}
