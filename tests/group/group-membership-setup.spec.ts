import { test } from '../../src/fixtures/auth.fixture';
import { ProfilePaymentPage } from '../../src/pages/profile/ProfilePaymentPage';
import { Logger } from '../../src/utils/Logger';

test(
  'Host configures group membership settings @regression @membership',
  async ({ page }) => {
    Logger.info('Starting Group Membership Setup test');

    const profilePaymentPage = new ProfilePaymentPage(page);

    await profilePaymentPage.openProfilePaymentPage();

    await profilePaymentPage.selectGroup('qatestgroup2');

    Logger.success('Group membership selection completed');
  }
);
