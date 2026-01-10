import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';
import { CreateSessionModal } from '../../src/pages/session/CreateSessionModal';
import { URLS } from '../../src/config/urls';
import { Logger } from '../../src/utils/Logger';

test.describe('Create Session', () => {
  test(
    'Host creates a session successfully',
    { tag: ['@smoke', '@regression'] },
    async ({ page }) => {
      Logger.info('Starting Create Session test');

      await page.goto(URLS.DASHBOARD);

      const dashboard = new DashboardPage(page);

      const canCreate = await dashboard.openCreateSessionFromAnySubscribedGroup();

      if (!canCreate) {
        test.skip(true, 'No subscribed group supports Create Session');
      }

      Logger.success('Create Session modal opened successfully');

      // Explicit modal ownership (never null)
      const createSessionModal = new CreateSessionModal(page);

      await createSessionModal.waitForVisible();
      await createSessionModal.fillRequiredFields({
        title: 'Automation Session',
        description: 'Session created via Playwright automation',
      });
      await createSessionModal.submit();

      await createSessionModal.expectSessionCreated();
    }
  );
});
