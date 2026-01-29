import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';
import { CreateSessionModal } from '../../src/pages/session/CreateSessionModal';
import { ViewSessionCard } from '../../src/pages/session/ViewSessionCard';
import { URLS } from '../../src/config/urls';
import { Logger } from '../../src/utils/Logger';
import { MyGroupsPage } from '@pages/dashboard/MyGroupsPage';
import { RuntimeStore } from '@utils/RuntimeStore';
import { DataGenerator } from '@utils/DataGenerator';

test.describe('Create Session', () => {
  test(
    'Host creates a session successfully',
    { tag: ['@regression'] },
    async ({ page }) => {
      Logger.info('Starting Create Session test');

      await page.goto(URLS.DASHBOARD);

      const myGroups = new MyGroupsPage(page);
      const canCreate = await myGroups.openSavedGroupSupportingCreateSession();

      if (!canCreate) {
        return
        const canCreateAny = await myGroups.openAnyGroupSupportingCreateSession();
        if (!canCreateAny) {
          test.skip(true, 'No subscribed group supports Create Session');
        }
      }

      Logger.success('Create Session modal opened successfully');
      const sessionTitle = DataGenerator.groupName();
      // Explicit modal ownership (never null)
      const createSessionModal = new CreateSessionModal(page);

      await createSessionModal.waitForVisible();
      await createSessionModal.fillRequiredFields({
        title: sessionTitle,
        description: 'Session created via Playwright automation',
      });

      await createSessionModal.submit();

      const successMessage = page.getByText('New Message');
      await expect(successMessage).toBeVisible({ timeout: 10_000 });

      Logger.step(`Session name: ${sessionTitle}:- Session created successfully`);

      // const sessionCard = new ViewSessionCard(page, sessionTitle);
      // await sessionCard.verifySessionCreated('Automation Session');

    }
  );
});
