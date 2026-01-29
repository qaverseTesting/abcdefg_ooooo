import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../config/urls';

/**
 * LandingPage
 * -----------
 * Represents the public landing page of MentalHappy.
 */
export class LandingPage extends BasePage {
    // Locators
    private readonly logo: Locator;

    /**
     * Constructor
     * @param page - Playwright Page
     */
    constructor(page: Page) {
        super(page);

        // Target the specific logo structure for the landing page
        this.logo = page.locator('a.brand svg, .brand.w-nav-brand svg').first();
    }

    /* ============================
       ACTIONS
       ============================ */

    /**
     * Navigates to the public landing page.
     */
    async navigate() {
        await this.goto(URLS.MH_SITE);
    }

    /* ============================
       VERIFICATIONS
       ============================ */

    /**
     * Verifies that the MentalHappy logo is visible.
     */
    async verifyLogoVisible() {
        await this.expectVisible(this.logo, 'MentalHappy logo should be visible');
    }
}
