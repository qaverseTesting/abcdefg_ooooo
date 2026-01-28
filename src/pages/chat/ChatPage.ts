import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';
import { Wait } from '../../utils/Wait';
import { CreateSessionModal } from '@pages/session/CreateSessionModal';

export class ChatPage extends BasePage {
  private readonly announcementBanner: Locator;
  private readonly announcementCloseBtn: Locator;
  private readonly plusButton: Locator;
  private readonly scheduleSessionMenu: Locator;
  private readonly createSessionModalIndicator: Locator;

  constructor(page: Page) {
    super(page);

    // 🔥 Scope banner properly
    this.announcementBanner = page.locator('[data-testid="announceView"]');

    this.announcementCloseBtn = this.announcementBanner.getByRole('button', {
      name: /close/i,
    });

    this.plusButton = page.locator('button[aria-haspopup="menu"]', {
      has: page.locator('svg line[x1="12"][y1="5"][x2="12"][y2="19"]'),
    });

    this.scheduleSessionMenu = page.locator('button[role="menuitem"]', {
      has: page.locator('p:has-text("Schedule a session")'),
    });

    this.createSessionModalIndicator = page.getByRole('heading', {
      name: /^schedule a session$/i,
    });
  }

  // KEEP EXISTING METHOD (DO NOT BREAK)
  async tryOpenCreateSession(): Promise<boolean> {
    try {
      await this.closeAnnouncementIfExists();

      if ((await this.plusButton.count()) === 0) {
        Logger.info('+ button not available');
        return false;
      }

      Logger.step('Clicking + button');
      await this.plusButton.first().click();

      if (
        !(await this.scheduleSessionMenu
          .first()
          .isVisible({ timeout: 3000 })
          .catch(() => false))
      ) {
        Logger.info('Schedule Session option not available');
        return false;
      }

      Logger.step('Clicking Schedule Session');
      await this.scheduleSessionMenu.first().click();

      await this.createSessionModalIndicator.waitFor({
        state: 'visible',
        timeout: 7000,
      });

      Logger.success('Create Session modal opened');
      return true;
    } catch {
      Logger.info('Create Session flow failed gracefully');
      return false;
    }
  }

  // NEW SAFE METHOD (USED BY TEST)
  async openCreateSessionModal(): Promise<CreateSessionModal | null> {
    const opened = await this.tryOpenCreateSession();
    return opened ? new CreateSessionModal(this.page) : null;
  }

  /**
   * Closes announcement banner if present
   * (Prevents overlay from blocking + button)
   */
  private async closeAnnouncementIfExists(): Promise<void> {
    if (!(await this.announcementBanner.isVisible().catch(() => false))) return;

    Logger.info('Announcement banner detected → closing');

    await this.announcementCloseBtn.click();

    // 🔥 Wait until banner is actually gone
    await this.announcementBanner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}
