import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class GroupActivationPaymentPage extends BasePage {
  private readonly stripeFrame: FrameLocator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    // Stripe Payment Element iframe
    this.stripeFrame = page.frameLocator(
      'iframe[title="Secure payment input frame"]'
    );

    this.submitButton = page.getByRole('button', {
      name: /pay and activate group/i,
    });
  }

  async waitForVisible(): Promise<void> {
    Logger.step('Waiting for Stripe Payment Element');

    const cardNumber = this.stripeFrame.locator(
      'input[autocomplete="cc-number"]'
    );

    await cardNumber.waitFor({ state: 'visible', timeout: 30_000 });
    await expect(cardNumber).toBeEditable({ timeout: 10_000 });

    Logger.success('Stripe Payment Element ready');
  }

  async fillPaymentDetails(): Promise<void> {
    Logger.step('Filling Stripe payment details');

    const frame = this.stripeFrame;

    const cardNumber = frame.locator('input[autocomplete="cc-number"]');
    const expiry = frame.locator('input[autocomplete="cc-exp"]');
    const cvc = frame.locator('input[autocomplete="cc-csc"]');
    const postal = frame.locator('input[autocomplete="postal-code"]');

    // Country field (Payment Element)
    const country = frame.locator('input[autocomplete="country"]');

    // ---- COUNTRY (INDIA) ----
    if (await country.isVisible({ timeout: 5000 }).catch(() => false)) {
      Logger.step('Selecting country: India');
      await country.click();
      await country.type('India', { delay: 40 });
      await country.press('Enter');
    }

    // ---- CARD NUMBER ----
    await cardNumber.click();
    await cardNumber.type('4242424242424242', { delay: 40 });

    // ---- EXPIRY ----
    await expiry.click();
    await expiry.type('1234', { delay: 40 });

    // ---- CVC ----
    await cvc.click();
    await cvc.type('123', { delay: 40 });

    // ---- POSTAL CODE ----
    if (await postal.isVisible({ timeout: 3000 }).catch(() => false)) {
      Logger.step('Entering postal code');
      await postal.click();
      await postal.type('560001', { delay: 40 }); // Indian PIN code format
    }

    // Validation checks
    await expect(cardNumber).not.toBeEmpty();
    await expect(expiry).not.toBeEmpty();
    await expect(cvc).not.toBeEmpty();

    Logger.success('Stripe payment details entered');
  }

  async submitPayment(): Promise<void> {
    Logger.step('Submitting payment');

    await this.page.waitForLoadState('networkidle'); // Stripe validation calls

    await expect(this.submitButton).toBeEnabled({ timeout: 15_000 });
    await this.submitButton.click();

    await expect(
      this.page.getByText(/payment was successful!/i)
    ).toBeVisible({ timeout: 20_000 });

    Logger.success('Payment success confirmed');
  }
}
