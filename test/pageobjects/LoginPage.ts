import BasePage from './BasePage';
import { ElementHelper } from '@helpers/ElementHelper';

class LoginPage extends BasePage {
    /**
     * Define Locators.
     * The recorded script used highly brittle IDs like: #gigya-loginID-79158041058054780
     * Replaced with stable CSS attributes for Gigya fields.
     */
    public get inputUsername() { return $('input[name="username"]'); }
    public get inputPassword() { return $('input[name="password"]'); }
    public get btnSubmitLogin() { return $('input[type="submit"][value="LOG IN"], button[aria-label="LOG IN"], [aria-label="LOG IN"]'); }
    
    /**
     * Performs the login action, abstracting away the Gigya popup intricacies.
     * @param username User's email
     * @param password User's password
     */
    public async login(username: string, password: string): Promise<void> {
        let isUsernameVisible = false;
        for (let i = 0; i < 3; i++) {
            try {
                await this.inputUsername.waitForDisplayed({ timeout: 5000 });
                isUsernameVisible = true;
                break;
            } catch (e) {
                Logger.warn(`Gigya popup not visible (attempt ${i + 1}), retrying clickHeaderLogin...`);
                await this.clickHeaderLogin();
            }
        }
        
        if (!isUsernameVisible) {
            throw new Error('Gigya Username Input still not displayed after multiple retries. Login popup may be blocked.');
        }

        await ElementHelper.setValue(this.inputUsername, username, 'Gigya Username Input');
        await ElementHelper.setValue(this.inputPassword, password, 'Gigya Password Input');
        await ElementHelper.click(this.btnSubmitLogin, 'Gigya Login Submit Button');
    }
}

export default new LoginPage();
