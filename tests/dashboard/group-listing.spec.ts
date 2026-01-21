import { test } from '../../src/fixtures/auth.fixture';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';

test.describe('Groups', () => {
  test(
    'Group listing loads with correct visibility and status',
    async ({ page }) => {
      const dashboard = new DashboardPage(page);

      await dashboard.verifyDashboardLoaded();

      await dashboard.groups.verifyGroupsArePresent();
      await dashboard.groups.verifyEachGroupHasTitle();
      await dashboard.groups.verifyGroupMemberCountVisible();
    }
  );
});
