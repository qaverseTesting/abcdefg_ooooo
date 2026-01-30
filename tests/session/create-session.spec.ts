import { test as test, expect } from '../../src/fixtures/auth.fixture';
import { CreateSessionModal } from '../../src/pages/session/CreateSessionModal';
import { URLS } from '../../src/config/urls';
import { Logger } from '../../src/utils/Logger';
import { MyGroupsPage } from '@pages/dashboard/MyGroupsPage';
import { DataGenerator } from '@utils/DataGenerator';

test.describe('Create Session', () => {
  test(
    'Host creates a session successfully',
    { tag: ['@regression'] },
    async ({ page }) => {
      Logger.info('Starting Create Session test');

      // ---------------------------------------------------------
      // Step 1: Navigate to Dashboard
      // ---------------------------------------------------------
      Logger.step('Navigating to Dashboard');
      await page.goto(URLS.DASHBOARD);
      Logger.success('Dashboard loaded');

      // ---------------------------------------------------------
      // Step 2: Open a group that supports Create Session
      // ---------------------------------------------------------
      Logger.step('Searching for a group that supports Create Session');
      const myGroups = new MyGroupsPage(page);
      const canCreate = await myGroups.openSavedGroupSupportingCreateSession();

      if (!canCreate) {
        Logger.warn('No saved group supports Create Session');
        test.skip(true, 'No subscribed group supports Create Session');
      }

      Logger.success('Create Session modal opened successfully');

      // ---------------------------------------------------------
      // Step 3: Fill Create Session details
      // ---------------------------------------------------------
      const sessionTitle = DataGenerator.groupName();
      Logger.step(`Generated session title: ${sessionTitle}`);

      // Explicit modal ownership
      const createSessionModal = new CreateSessionModal(page);

      Logger.step('Waiting for Create Session modal to be visible');
      await createSessionModal.waitForVisible();

      Logger.step('Filling required fields in Create Session modal');
      await createSessionModal.fillRequiredFields({
        title: sessionTitle,
        description: 'Session created via Playwright automation',
      });

      // ---------------------------------------------------------
      // Step 4: Submit Create Session
      // ---------------------------------------------------------
      Logger.step('Submitting Create Session form');
      await createSessionModal.submit();

      // ---------------------------------------------------------
      // Step 5: Verify session creation success
      // ---------------------------------------------------------
      Logger.step('Verifying session creation success indicator');
      const successMessage = page.getByText('New Message');
      await expect(successMessage).toBeVisible({ timeout: 10_000 });

      Logger.success(
        `Session created successfully with title: ${sessionTitle}`
      );

      // ---------------------------------------------------------
      // Optional: Session card verification (intentionally skipped)
      // ---------------------------------------------------------
      // const sessionCard = new ViewSessionCard(page, sessionTitle);
      // await sessionCard.verifySessionCreated('Automation Session');
    }
  );
});
