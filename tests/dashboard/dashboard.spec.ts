import { test } from '../../src/fixtures/auth.fixture';
import { UserRole } from '../../src/constants/roles';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';
import { Logger } from '../../src/utils/Logger';

test('Dashboard loads after fresh login',
    { tag: ['@smoke', '@regression'] }, async ({ page }) => {
  Logger.step('Navigating to dashboard');

const dashboard = new DashboardPage(page);
await dashboard.open();
await dashboard.verifyDashboardLoaded();
}

);
