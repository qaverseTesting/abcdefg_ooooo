import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class GroupActivationPaymentPage extends BasePage {
  private readonly stripeFrame: FrameLocator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.stripeFrame = page.frameLocator(
      'iframe[title="Secure payment input frame"]'
    );

    this.submitButton = page.getByRole('button', {
      name: /pay and activate group/i,
    });
  }

  /**
   * Wait until Stripe Elements are fully mounted and interactive
   */
  async waitForVisible(): Promise<void> {
    Logger.step('Waiting for Stripe payment iframe');

    const cardNumber = this.stripeFrame.locator(
      'input[autocomplete="cc-number"]'
    );

    await cardNumber.waitFor({ state: 'visible', timeout: 30_000 });
    await expect(cardNumber).toBeEditable({ timeout: 10_000 });

    Logger.success('Stripe payment inputs are ready');
  }

  /**
   * Fill Stripe test card details reliably
   */
  async fillPaymentDetails(): Promise<void> {
    Logger.step('Entering Stripe test card details');

    const frame = this.stripeFrame;

    const cardNumber = frame.locator('input[autocomplete="cc-number"]');
    const expiry = frame.locator('input[autocomplete="cc-exp"]');
    const cvc = frame.locator('input[autocomplete="cc-csc"]');
    const zip = frame.locator('input[autocomplete="postal-code"]');

    // CARD NUMBER
    await cardNumber.click({ force: true });
    await cardNumber.type('4242424242424242', { delay: 50 });

    // EXPIRY
    await expiry.click({ force: true });
    await expiry.type('1234', { delay: 50 }); // Stripe formats to 12 / 34

    // CVC
    await cvc.click({ force: true });
    await cvc.type('123', { delay: 50 });

    // ZIP (optional)
    if (await zip.isVisible().catch(() => false)) {
      await zip.click({ force: true });
      await zip.type('12345', { delay: 50 });
    }

    // Final sanity check (prevents silent failures)
    await expect(cardNumber).not.toBeEmpty();
    await expect(expiry).not.toBeEmpty();
    await expect(cvc).not.toBeEmpty();

    Logger.success('Stripe payment details entered successfully');
  }

  /**
   * Submit payment
   */
  async submitPayment(): Promise<void> {
    Logger.step('Submitting payment');

    await expect(this.submitButton).toBeEnabled({ timeout: 15_000 });
    await this.submitButton.click();

    Logger.success('Payment submitted');
  }
}