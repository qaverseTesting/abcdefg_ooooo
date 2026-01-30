import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { ENV } from '../../config/env';
import { Wait } from '../../utils/Wait';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly logInButton: Locator;
  private readonly createAccountLink: Locator;
  private readonly loginHeading: Locator;
  private readonly loginErrorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.usernameInput = page.getByRole('textbox', { name: 'Username / Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.logInButton = page.getByRole('button', { name: 'Log in', exact: true });
    this.createAccountLink = page.getByRole('link', { name: 'Create an account' });
    this.loginHeading = page.locator('h3.chakra-text', { hasText: 'Login' });
    this.loginErrorMessage = page.getByText("The username/email or password you've entered is incorrect.", { exact: true });
  }

  async verifyLoginPageVisible() {
    await this.expectVisible(this.loginHeading, 'Login heading should be visible');
  }

  async verifyInvalidLoginError() {
    // Assert that an error alert is visible
    await this.expectVisible(this.loginErrorMessage, 'Invalid login error message should be visible');
  }

  async clickCreateAccount() {
    await this.click(this.createAccountLink);
    await Wait.pause(this.page, 1000);
  }

  async openLoginPage() {
    await this.goto(ENV.BASE_URL);
  }

  async login(username: string, password: string) {
    await this.stableFill(this.usernameInput, username);
    await this.stableFill(this.passwordInput, password);

    // Real user submit
    await this.click(this.logInButton);
    await Wait.pause(this.page, 9000);
  }

}
