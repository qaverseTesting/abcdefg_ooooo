import { expect, test } from '@playwright/test';
import { MyGroupsPage } from '../../src/pages/dashboard/MyGroupsPage';
import { GroupActivationPaymentPage } from '../../src/pages/payment/GroupActivationPaymentPage';
import { ProfilePaymentPage } from '../../src/pages/profile/ProfilePaymentPage';
import { Logger } from '../../src/utils/Logger';

test('Host activates group successfully using payment',
    { tag: ['@regression'] }, async ({ page }) => {
  Logger.info('Starting Group Activation – Payment test');

  const myGroupsPage = new MyGroupsPage(page);
  const paymentPage = new GroupActivationPaymentPage(page);
  const profilePaymentPage = new ProfilePaymentPage(page);

  //  Find inactive group and go to payment
  const result =
    await myGroupsPage.openInactiveGroupAndRedirectToPayment();

  if (result.status === 'NOT_FOUND') {
    test.skip(true, 'No inactive group available for activation test');
    return; //  REQUIRED for TypeScript narrowing
  }

  const activatedGroupName = result.groupName;

  //  Complete payment
  await paymentPage.waitForVisible();
  await paymentPage.fillPaymentDetails();
  await paymentPage.submitPayment();

  Logger.success('Group Activation – Payment Flow completed successfully');
});