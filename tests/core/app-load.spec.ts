import { test } from '../../src/fixtures/auth.fixture';
import { Logger } from '../../src/utils/Logger';
import { LandingPage } from '../../src/pages/public/LandingPage';

/* =========================================================
   App Load – Core
   Verifies public application load and logo visibility.
   This test ensures the landing page is accessible and 
   the branding (logo) is correctly displayed.
========================================================= */
test.describe('App Load', () => {

  test(
    'Application loads successfully',
    { tag: ['@smoke', '@public'] },
    async ({ page }) => {
      const landingPage = new LandingPage(page);

      // 1. Navigate to the MentalHappy public URL
      Logger.step('Navigating to landing page');
      await landingPage.navigate();

      // 2. Verify the "MentalHappy" logo is visible
      Logger.step('Verifying "MentalHappy" logo visibility');
      await landingPage.verifyLogoVisible();

      // 3. Confirm App Load message
      Logger.success('App Load › Application loads successfully');
    }
  );
});
