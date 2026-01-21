import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';
import { CreateSessionModal } from '../../src/pages/session/CreateSessionModal';
import { ViewSessionCard } from '../../src/pages/session/ViewSessionCard';
import { URLS } from '../../src/config/urls';
import { Logger } from '../../src/utils/Logger';
import { MyGroupsPage } from '@pages/dashboard/MyGroupsPage';

test.describe('Create Session', () => {
  test(
    'Host creates a session successfully',
    { tag: ['@regression'] },
    async ({ page }) => {
      Logger.info('Starting Create Session test');

      await page.goto(URLS.DASHBOARD);

      const myGroups = new MyGroupsPage(page);
      const canCreate = await myGroups.openAnyGroupSupportingCreateSession();

      if (!canCreate) {
        test.skip(true, 'No subscribed group supports Create Session');
      }

      const sessionTitle = 'Automation Session';

      Logger.success('Create Session modal opened successfully');

      // Explicit modal ownership (never null)
      const createSessionModal = new CreateSessionModal(page);

      await createSessionModal.waitForVisible();
      await createSessionModal.fillRequiredFields({
        title: sessionTitle,
        description: 'Session created via Playwright automation',
      });
      await createSessionModal.submit();

      await createSessionModal.expectSessionCreated();

      // NEW: View Session validation
      const viewSessionPopup = new ViewSessionCard(page);

      await viewSessionPopup.waitForVisible();
      await viewSessionPopup.expectSessionTitle(sessionTitle);

      Logger.success('Session created and verified successfully');
    }
  );
});
