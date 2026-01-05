// tests/group/create-group.spec.ts
import { test } from '../../src/fixtures/auth.fixture';
import { URLS } from '../../src/config/urls';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';
import { GroupOnboardingPage } from '../../src/pages/group/GroupOnboardingPage';
import { GroupProfilePage } from '../../src/pages/group/GroupProfilePage';
import { CreateGroupPage } from '../../src/pages/group/CreateGroupPage';
import { DataGenerator } from '../../src/utils/DataGenerator';
import { Logger } from '../../src/utils/Logger';

test.describe('Group Creation', () => {
  test(
    'Group Host can create a group successfully',
    { tag: ['@smoke', '@regression'] },
    async ({ page }) => {
      Logger.info('Starting Group Creation test');

      const groupName = DataGenerator.groupName();

      // Step 1: Launch Dashboard URL (auth already applied via storageState)
      await page.goto(URLS.DASHBOARD);

      // Step 2: Dashboard → Start Group
      const dashboard = new DashboardPage(page);
      await dashboard.clickStartGroup();

      // Step 3: Create Group Page
      const createGroup = new CreateGroupPage(page);
      await createGroup.verifyPageLoaded();

      // Step 4–6: Enter Group Details
      await createGroup.enterGroupDetails(
        groupName,
        DataGenerator.description(),
        'Weekly on Monday'
      );

      Logger.step(`${groupName}:- group name is Created`);
  
      // Step 7–9: Select Tags
      await createGroup.selectRandomTag();

      // Step 10: Submit
      await createGroup.submitGroup();
      await createGroup.confirmSubmit();

      //Step 11: Onboarding
      const onboarding = new GroupOnboardingPage(page);
      await onboarding.skipOnboarding();

      //Step 12: Profile verification
      const profile = new GroupProfilePage(page);
      await profile.verifyGroupNameVisible(groupName);
      Logger.success('Group created successfully');
    }
  );
});
