import BasePage from './BasePage';
import { ElementHelper } from '@helpers/ElementHelper';
import { WaitHelper } from '@helpers/WaitHelper';
import { Logger } from '@utils/logger';

class ParentPage extends BasePage {
    /**
     * Define Locators for Parent/Caregiver page
     */

    // Add specific locators here
    // public get inputFirstName() { return $('#parentFirstName'); }
    // public get inputLastName() { return $('#parentLastName'); }

    // Navigation and Generic Locators
    public get btnContinue() { return $('//button[contains(translate(text(), "continue", "CONTINUE"), "CONTINUE") or contains(@aria-label, "CONTINUE")]'); }
    public get btnLogout() { return $('a[href*="logout"], button[aria-label*="Logout"], #logoutBtn'); }

    // Signup Locators
    public get btnSignUpTab() { return $('//a[@data-switch-screen="gigya-register-screen"] | //button[contains(text(), "Sign Up")] | //a[contains(text(), "Sign Up")]'); }
    public get inputSignupEmail() { return $('input[name="email"], input[placeholder*="Email"]'); }
    public get inputSignupPassword() { return $('input[name="password"], input[placeholder*="Password"]'); }
    public get inputSignupConfirmPassword() { return $('input[name="passwordRetype"], input[placeholder*="Confirm Password"]'); }
    public get btnSubmitSignup() { return $('//input[@type="submit" and contains(@value, "REGISTER")] | //button[contains(text(), "Sign Up")] | //input[contains(@value, "SIGN UP")]'); }

    // OTP Verification Locators
    public get inputOtpCode() { return $('input[name="code"], input[placeholder*="Code"], input[placeholder*="OTP"]'); }
    public get btnVerifyOtp() { return $('//input[@type="submit" and contains(@value, "VERIFY")] | //button[contains(text(), "Verify")]'); }

    // Login Locators (if specific to parent, otherwise can use LoginPage)
    public get inputUsername() { return $('input[name="username"], input[name="loginID"]'); }
    public get inputPassword() { return $('input[name="password"]'); }
    public get btnSubmitLogin() { return $('input[type="submit"][value="LOG IN"], button[aria-label="LOG IN"], [aria-label="LOG IN"]'); }

    /**
     * Add specific methods for parent related actions here
     */
    public async fillParentDetails(parentData: any): Promise<void> {
        Logger.info('Filling parent details...');
        // Example implementation:
        // await ElementHelper.setValue(this.inputFirstName, parentData.firstName, 'Parent First Name');
        await WaitHelper.waitForLoadingToDisappear();
    }

    /**
     * Signs up a new parent account
     */
    public async signupParent(parentDetails: any): Promise<void> {
        Logger.info(`Signing up parent with email: ${parentDetails.email}`);
        await this.clickHeaderLogin(); // Opens the login/register modal
        await ElementHelper.click(this.btnSignUpTab, 'Sign Up Tab');

        await browser.pause(2000); // Wait for modal animation to switch to Sign Up

        if (parentDetails.firstName) {
            const firstNames = await $$('input[name="firstName"], input[name="profile.firstName"], input[placeholder*="First Name" i], input[placeholder*="Adult First Name" i], input[aria-label*="Adult First Name" i], [aria-label*="Adult First Name" i]');
            for (const fn of firstNames) {
                if (await fn.isDisplayed()) {
                    try {
                        await ElementHelper.setValue(fn, parentDetails.firstName, 'Signup First Name');
                        break;
                    } catch (e) {
                        Logger.info('First Name input not interactable, trying next...');
                    }
                }
            }
        }

        if (parentDetails.lastName) {
            const lastNames = await $$('input[name="lastName"], input[name="profile.lastName"], input[placeholder*="Last Name" i], input[placeholder*="Adult Last Name" i], input[aria-label*="Adult Last Name" i], [aria-label*="Adult Last Name" i]');
            for (const ln of lastNames) {
                if (await ln.isDisplayed()) {
                    try {
                        await ElementHelper.setValue(ln, parentDetails.lastName, 'Signup Last Name');
                        break;
                    } catch (e) {
                        Logger.info('Last Name input not interactable, trying next...');
                    }
                }
            }
        }

        if (parentDetails.phone) {
            const phones = await $$('input[name="phoneNumber"], input[name="data.phoneNumber"], input[placeholder*="Phone" i], input[type="tel"]');
            for (const ph of phones) {
                if (await ph.isDisplayed()) {
                    try {
                        await ElementHelper.setValue(ph, parentDetails.phone, 'Signup Phone');
                        break;
                    } catch (e) {
                        Logger.info('Phone input not interactable, trying next...');
                    }
                }
            }
        }

        // Find visible email input
        const emails = await $$('input[name="email"], input[type="email"], input[placeholder*="Email" i]');
        for (const email of emails) {
            if (await email.isDisplayed()) {
                try {
                    await ElementHelper.setValue(email, parentDetails.email, 'Signup Email');
                    break;
                } catch (e) {
                    Logger.info('Email input not interactable, trying next...');
                }
            }
        }

        if (parentDetails.zipCode) {
            const zips = await $$('input[name="zip"], input[name="zipCode"], input[placeholder*="Zip" i], input[placeholder*="Postal" i]');
            for (const zip of zips) {
                if (await zip.isDisplayed()) {
                    try {
                        await ElementHelper.setValue(zip, parentDetails.zipCode, 'Signup Zip Code');
                        break;
                    } catch (e) {
                        Logger.info('Zip code input not interactable, trying next...');
                    }
                }
            }
        }

        // Find visible password inputs
        const passwords = await $$('input[type="password"]');
        let pwdIndex = 0;
        for (const pwd of passwords) {
            if (await pwd.isDisplayed()) {
                try {
                    if (pwdIndex === 0) {
                        await ElementHelper.setValue(pwd, parentDetails.password, 'Signup Password');
                    } else if (pwdIndex === 1) {
                        await ElementHelper.setValue(pwd, parentDetails.password, 'Confirm Password');
                    }
                    pwdIndex++;
                } catch (e) {
                    Logger.info('Password input not interactable, trying next...');
                }
            }
        }

        // Handle CAPTCHA if present
        try {
            const iframes = await $$('iframe[title*="recaptcha" i], iframe[src*="recaptcha" i]');
            for (const iframe of iframes) {
                if (await iframe.isDisplayed()) {
                    await browser.switchToFrame(iframe);
                    const checkbox = await $('.recaptcha-checkbox-border, #recaptcha-anchor');
                    if (await checkbox.isDisplayed()) {
                        await checkbox.click();
                        Logger.info('Clicked reCAPTCHA checkbox inside iframe');
                        await browser.pause(3000);
                    }
                    await browser.switchToParentFrame();
                    break;
                }
            }
        } catch (e) {
            Logger.info('Error handling iframe CAPTCHA, skipping...');
            await browser.switchToParentFrame();
        }

        try {
            const gigyaSaptcha = await $('#gigya-saptcha-checkbox');
            if (await gigyaSaptcha.isExisting()) {
                await browser.execute(() => {
                    const el = document.getElementById('gigya-saptcha-checkbox');
                    if (el) el.click();
                });
                Logger.info('Clicked #gigya-saptcha-checkbox via JS');
                await browser.pause(2000);
            }
        } catch (e) { }

        try {
            // Check for custom/native captcha text or any checkboxes in the gigya form
            await browser.execute(() => {
                const labels = Array.from(document.querySelectorAll('label, span, div'));
                for (const lbl of labels) {
                    if (lbl.textContent && lbl.textContent.toLowerCase().includes('not a robot')) {
                        (lbl as HTMLElement).click();
                        return;
                    }
                }
                const checkboxes = Array.from(document.querySelectorAll('#gigya-register-screen input[type="checkbox"]'));
                for (const chk of checkboxes) {
                    if ((chk as HTMLElement).offsetHeight > 0) {
                        (chk as HTMLElement).click();
                    }
                }
            });
            await browser.pause(3000);
        } catch (e) { }

        // Find visible submit button
        const submitBtnsCss = await $$('input[type="submit"], button[type="submit"], input[value*="REGISTER" i], input[value*="SIGN" i], input[value*="SUBMIT" i], input[value*="CREATE" i]');
        const submitBtnsXpath = await $$('//button[contains(translate(text(), "CREATE", "create"), "create") or contains(translate(text(), "REGISTER", "register"), "register") or contains(translate(text(), "SIGN", "sign"), "sign")]');
        const submitBtns = [...submitBtnsCss, ...submitBtnsXpath];
        let clickedSubmit = false;
        for (const btn of submitBtns) {
            if (await btn.isDisplayed()) {
                try {
                    await ElementHelper.click(btn, 'Submit Signup');
                    clickedSubmit = true;
                    break;
                } catch (e) {
                    Logger.info('Submit button not interactable, trying next...');
                }
            }
        }

        if (clickedSubmit) {
            await browser.pause(2000);
            try {
                await browser.waitUntil(async () => {
                    const otps = await $$('input[name="code"], input[placeholder*="Code" i], input[placeholder*="OTP" i]');
                    if (otps.length > 0 && await otps[0].isDisplayed()) return true;
                    const texts = await $$('h1, h2, span, p');
                    for (const t of texts) {
                        if (await t.isDisplayed()) {
                            const text = await t.getText();
                            if (text.toLowerCase().includes('verify your email')) return true;
                        }
                    }
                    return false;
                }, { timeout: 15000, timeoutMsg: 'OTP Verification Screen did not load after submitting registration. Check for validation errors or CAPTCHA.' });
            } catch (e) {
                Logger.info('Failed to transition to OTP screen. Form might have validation errors.');
                // Attempt to take a screenshot via allure if possible, or just throw
                throw e;
            }
        }

        await WaitHelper.waitForLoadingToDisappear();
    }

    /**
     * Verifies the OTP sent during signup
     */
    public async verifyOtp(otpCode: string): Promise<void> {
        Logger.info('Verifying OTP code...');

        const otpInputs = await $$('input[name="code"], input[placeholder*="Code" i], input[placeholder*="OTP" i]');
        for (const input of otpInputs) {
            if (await input.isDisplayed()) {
                try {
                    await ElementHelper.setValue(input, otpCode, 'OTP Code');
                    break;
                } catch (e) {
                    Logger.info('OTP input not interactable, trying next...');
                }
            }
        }

        const submitBtns = await $$('input[type="submit"], button[type="submit"], input[value*="VERIFY" i], button[value*="VERIFY" i]');
        for (const btn of submitBtns) {
            if (await btn.isDisplayed()) {
                try {
                    await ElementHelper.click(btn, 'Verify OTP Button');
                    break;
                } catch (e) {
                    Logger.info('Verify button not interactable, trying next...');
                }
            }
        }
        await WaitHelper.waitForLoadingToDisappear();
    }

    /**
     * Logs in the parent
     */
    public async loginParent(username: string, password: string): Promise<void> {
        Logger.info(`Logging in parent: ${username}`);
        await this.clickHeaderLogin();
        await browser.pause(2000); // Wait for modal

        const userInputs = await $$('input[name="username"], input[name="loginID"]');
        for (const input of userInputs) {
            if (await input.isDisplayed()) {
                try {
                    await ElementHelper.setValue(input, username, 'Parent Username');
                    break;
                } catch (e) {
                    Logger.info('Username input not interactable, trying next...');
                }
            }
        }

        const passInputs = await $$('input[name="password"], input[type="password"]');
        for (const input of passInputs) {
            if (await input.isDisplayed()) {
                try {
                    await ElementHelper.setValue(input, password, 'Parent Password');
                    break;
                } catch (e) {
                    Logger.info('Password input not interactable, trying next...');
                }
            }
        }

        const submitBtns = await $$('input[type="submit"], button[type="submit"], input[value*="LOG IN" i]');
        for (const btn of submitBtns) {
            if (await btn.isDisplayed()) {
                try {
                    await ElementHelper.click(btn, 'Submit Login');
                    break;
                } catch (e) {
                    Logger.info('Submit button not interactable, trying next...');
                }
            }
        }
        await WaitHelper.waitForLoadingToDisappear();
    }

    /**
     * Logs out the parent
     */
    public async logout(): Promise<void> {
        Logger.info('Logging out parent...');
        await browser.pause(2000); // Wait for post-login UI to settle

        const logoutBtns = await $$('//button[contains(translate(text(), "LOGOUT", "logout"), "logout")] | //a[contains(translate(text(), "LOGOUT", "logout"), "logout")] | //button[@id="loginBtn" and contains(text(), "Logout")]');
        for (const btn of logoutBtns) {
            if (await btn.isDisplayed()) {
                try {
                    await ElementHelper.click(btn, 'Logout Button');
                    break;
                } catch (e) {
                    Logger.info('Logout button not interactable, trying next...');
                }
            }
        }
        await WaitHelper.waitForLoadingToDisappear();
    }

    /**
     * Proceeds to next section
     */
    public async clickContinue(): Promise<void> {
        await ElementHelper.click(this.btnContinue, 'Parent Page Continue Button');
        await WaitHelper.waitForLoadingToDisappear();
    }
}

export default new ParentPage();
