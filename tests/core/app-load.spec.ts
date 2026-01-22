import { test } from '../../src/fixtures/auth.fixture';
import { UserRole } from '../../src/constants/roles';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';
import { Logger } from '../../src/utils/Logger';

const TEST_ROLE = process.env.TEST_ROLE;

/* =========================================================
   App Load – Core
   Verifies application loads successfully after auth
========================================================= */
test.describe('App Load', () => {

  test(
    'Application loads successfully',
    { tag: ['@auth', '@smoke', '@regression'] },
    async ({ page }, testInfo) => {
        
      Logger.step('Verifying application load');

      const dashboard = new DashboardPage(page);
      await dashboard.open();
      await dashboard.verifyDashboardLoaded();
    }
  );
});
