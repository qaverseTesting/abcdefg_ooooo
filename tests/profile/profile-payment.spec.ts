import { test } from '../../src/fixtures/auth.fixture';
import { UserRole } from '../../src/constants/roles';
import { ProfilePaymentPage } from '../../src/pages/profile/ProfilePaymentPage';
import { Logger } from '../../src/utils/Logger';

/* =========================================================
   Profile – Payment Page Load
   Verifies that the user can access the billing/payment section.
========================================================= */
// test.describe('Profile - Payment Section', () => {

//     test(
//         'Payment Page Load: Verify profile payment/billing section loads without errors',
//         { tag: ['@profile', '@payment', '@regression'] },
//         async ({ loginAs, page }) => {
//             const paymentPage = new ProfilePaymentPage(page);

//             // 1. Login as Group Host
//             Logger.step('Logging in as Group Host');
//             await loginAs(UserRole.GROUP_HOST);

//             // 2. Navigate to Profile → Payments page
//             Logger.step('Navigating to Profile Payments page');
//             await paymentPage.openProfilePaymentPage();

//             // 3. Verify page is loaded successfully (Locators moved to Page Object)
//             await paymentPage.verifyPaymentPageVisible();

//             Logger.success('Profile › Payment section loaded successfully');
//         }
//     );
// });
