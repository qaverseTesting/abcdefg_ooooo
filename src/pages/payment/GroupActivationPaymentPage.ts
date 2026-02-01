import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class GroupActivationPaymentPage extends BasePage {
  private readonly stripeFrame: FrameLocator;
  private readonly submitButton: Locator;
  private readonly postalCodeInput: Locator;

  constructor(page: Page) {
    super(page);

    // Stripe secure iframe
    this.stripeFrame = page.frameLocator(
      'iframe[title="Secure payment input frame"]'
    );

    // Postal code lives OUTSIDE Stripe iframe
    this.postalCodeInput = page.locator('#payment-postalCodeInput');

    this.submitButton = page.getByRole('button', {
      name: /pay and activate group/i,
    });
  }

  async waitForVisible(): Promise<void> {
    Logger.step('Waiting for Stripe payment iframe to become interactive');

    const cardNumber = this.stripeFrame.locator(
      'input[autocomplete="cc-number"]'
    );

    await cardNumber.waitFor({ state: 'visible', timeout: 30_000 });
    await expect(cardNumber).toBeEditable({ timeout: 10_000 });

    Logger.success('Stripe payment iframe ready');
  }

  async fillPaymentDetails(): Promise<void> {
    Logger.step('Entering Stripe test card details');

    const frame = this.stripeFrame;

    const cardNumber = frame.locator('input[autocomplete="cc-number"]');
    const expiry = frame.locator('input[autocomplete="cc-exp"]');
    const cvc = frame.locator('input[autocomplete="cc-csc"]');

    // ---- CARD NUMBER ----
    await cardNumber.click();
    await cardNumber.type('4242424242424242', { delay: 40 });

    // ---- EXPIRY ----
    await expiry.click();
    await expiry.type('1234', { delay: 40 });

    // ---- CVC ----
    await cvc.click();
    await cvc.type('123', { delay: 40 });

    // ---- POSTAL CODE (MAIN DOM, NOT IFRAME) ----
    if (await this.postalCodeInput.isVisible()) {
      Logger.step('Entering postal / ZIP code');
      await this.postalCodeInput.fill('12345');
    }

    // Final checks
    await expect(cardNumber).not.toBeEmpty();
    await expect(expiry).not.toBeEmpty();
    await expect(cvc).not.toBeEmpty();

    Logger.success('Payment details entered successfully');
  }

  async submitPayment(): Promise<void> {
    Logger.step('Submitting group activation payment');

    await expect(this.submitButton).toBeEnabled({ timeout: 15_000 });

    await this.submitButton.click();

    await expect(
      this.page.getByText(/payment was successful!/i)
    ).toBeVisible({ timeout: 20_000 });

    Logger.success('Payment submitted and group activation confirmed');
  }
}
