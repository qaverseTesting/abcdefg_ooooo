import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';
import { CreateSessionModal } from '@pages/session/CreateSessionModal';

export class ChatPage extends BasePage {
  private readonly announcementCloseBtn: Locator;
  private readonly plusButton: Locator;
  private readonly scheduleSessionMenu: Locator;
  private readonly createSessionModalIndicator: Locator;

  constructor(page: Page) {
    super(page);

    this.announcementCloseBtn = page.getByRole('button', { name: /close/i });

    this.plusButton = page.locator(
      'button[aria-haspopup="menu"]',
      {
        has: page.locator(
          'svg line[x1="12"][y1="5"][x2="12"][y2="19"]'
        ),
      }
    );

    this.scheduleSessionMenu = page.locator(
      'button[role="menuitem"]',
      {
        has: page.locator('p:has-text("Schedule a session")'),
      }
    );

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

  private async closeAnnouncementIfExists(): Promise<void> {
    if (await this.announcementCloseBtn.isVisible().catch(() => false)) {
      Logger.info('Closing announcement banner');
      await this.announcementCloseBtn.click();
    }
  }
}
