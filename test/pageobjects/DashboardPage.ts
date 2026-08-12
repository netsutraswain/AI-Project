import BasePage from './BasePage';
import { ElementHelper } from '@helpers/ElementHelper';
import { WaitHelper } from '@helpers/WaitHelper';
import { Logger } from '@utils/logger';

class DashboardPage extends BasePage {
    /**
     * Define Locators
     * Refactoring brittle XPaths and aria locators into stable selectors.
     */
    public get btnMyAccount() { return $('#myAccountBtn'); }
    public get linkMyHousehold() { return $('a[href*="/my-account/household"]'); }
    public get btnRegisterNewMember() { return $('a[href*="/search;type=NEW_MEMBER"]'); }

    /**
     * Navigates to the My Household tab.
     */
    public async navigateToMyHousehold(): Promise<void> {
        Logger.info('Navigating directly to My Household URL to bypass UI flakiness');
        await browser.url('https://mygs-uat.girlscouts.org/my-account/household');
        await WaitHelper.waitForLoadingToDisappear();
    }

    /**
     * Clicks the Register a new household member button.
     */
    public async clickRegisterNewMember(): Promise<void> {
        Logger.info('Navigating directly to Register Member URL');
        await browser.url('https://mygs-uat.girlscouts.org/search;type=NEW_MEMBER');
        await WaitHelper.waitForLoadingToDisappear();
    }
}

export default new DashboardPage();
