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
        await ElementHelper.setValue(this.inputUsername, username, 'Gigya Username Input');
        await ElementHelper.setValue(this.inputPassword, password, 'Gigya Password Input');
        await ElementHelper.click(this.btnSubmitLogin, 'Gigya Login Submit Button');
    }
}

export default new LoginPage();
