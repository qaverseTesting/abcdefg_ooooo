// tests/group/create-group.spec.ts
import { test as test, expect } from '../../src/fixtures/auth.fixture';
import { URLS } from '../../src/config/urls';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';
import { CreateGroupPage } from '../../src/pages/group/CreateGroupPage';
import { DataGenerator } from '../../src/utils/DataGenerator';
import { Logger } from '../../src/utils/Logger';
import { RuntimeStore } from '../../src/utils/RuntimeStore';

test.describe('Group Creation', () => {
  test(
    'Group Host can create a group successfully',
    { tag: ['@smoke', '@regression'] },
    async ({ page }) => {
      Logger.info('Starting Group Creation test');

      const groupName = DataGenerator.groupName();
      Logger.step(`Generated group name: ${groupName}`);

      // Step 1: Launch Dashboard
      Logger.step('Navigating to Dashboard');
      await page.goto(URLS.DASHBOARD);
      Logger.success('Dashboard loaded');

      // Step 2: Dashboard → Start Group
      Logger.step('Clicking "Start Group" from Dashboard');
      const dashboard = new DashboardPage(page);
      await dashboard.clickStartGroup();
      Logger.success('"Start Group" clicked');

      // Step 3: Create Group Page
      Logger.step('Verifying Create Group page loaded');
      const createGroup = new CreateGroupPage(page);
      await createGroup.verifyPageLoaded();
      Logger.success('Create Group page loaded');

      // Step 4–6: Enter Group Details
      Logger.step('Entering group details');
      await createGroup.enterGroupDetails(
        groupName,
        DataGenerator.description(),
        'Weekly on Monday'
      );
      Logger.success('Group details entered');

      // Step 7–9: Select Tags
      Logger.step('Selecting random group tag');
      await createGroup.selectRandomTag();
      Logger.success('Group tag selected');

      // Step 10: Submit
      Logger.step('Submitting Create Group form');
      await createGroup.submitGroup();
      await createGroup.confirmSubmit();
      Logger.success('Create Group submitted');

      // Success assertion
      Logger.step('Verifying group creation success message');
      const successMessage = page.getByText('Group created successfully!');
      await expect(successMessage).toBeVisible({ timeout: 10_000 });
      Logger.success('Group created successfully (confirmation visible)');

      // Persist group name for downstream tests
      RuntimeStore.saveGroupName(groupName);
      Logger.success(`Group name stored for reuse: ${groupName}`);

      Logger.info('Group Creation test completed successfully');
    }
  );
});
