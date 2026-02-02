import { Page, Locator } from '@playwright/test';
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

    // UPDATED — label text changed
    this.usernameInput = page.getByLabel('Email or Username');

    // same field, but now properly associated with label
    this.passwordInput = page.getByLabel('Password');

    // Button is now type="submit" but role still button
    this.logInButton = page.getByRole('button', { name: 'Log in' });

    // Text changed from "Create an account" → "Sign Up"
    this.createAccountLink = page.getByRole('link', { name: 'Sign Up' });

    // Heading text changed from "Login" → "Welcome Back!"
    this.loginHeading = page.getByRole('heading', { name: 'Welcome Back!' });

    // No error DOM provided — keeping old locator
    this.loginErrorMessage = page.getByText(
      "The username/email or password you've entered is incorrect.",
      { exact: true }
    );
  }

  async verifyLoginPageVisible() {
    await this.expectVisible(this.loginHeading, 'Login heading should be visible');
  }

  async verifyInvalidLoginError() {
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

    await this.click(this.logInButton);
    await Wait.pause(this.page, 9000);
  }
}
