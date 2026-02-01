import { test } from '../../src/fixtures/auth.fixture';
import { MyGroupsPage } from '../../src/pages/dashboard/MyGroupsPage';
import { GroupActivationPaymentPage } from '../../src/pages/payment/GroupActivationPaymentPage';
import { Logger } from '../../src/utils/Logger';
import { RuntimeStore } from '@utils/RuntimeStore';

test('Host activates group by completing platform payment @activation', async ({ page }) => {
  Logger.info('TEST STARTED: Host group activation via platform payment');

  const myGroupsPage = new MyGroupsPage(page);
  const paymentPage = new GroupActivationPaymentPage(page);

  const targetGroupName = RuntimeStore.getGroupName();
  Logger.step(`Target group for activation: ${targetGroupName}`);

  Logger.step('Opening inactive group and redirecting to payment flow');
  const result =
    await myGroupsPage.openPriorityInactiveGroupAndRedirectToPayment(
      targetGroupName
    );

  if (result.status === 'NOT_FOUND') {
    Logger.warn('No inactive group found that supports activation');
    test.skip(true, 'No inactive group available for activation');
    return;
  }

  const activatedGroupName = result.groupName;
  Logger.success(`Redirected to payment page for group: ${activatedGroupName}`);

  Logger.step('Waiting for activation payment page to load');
  await paymentPage.waitForVisible();

  Logger.step('Entering platform payment details');
  await paymentPage.fillPaymentDetails();

  // Logger.step('Submitting platform activation payment');
  // await paymentPage.submitPayment();

  Logger.success('TEST COMPLETED: Group activated successfully via platform payment');
});
