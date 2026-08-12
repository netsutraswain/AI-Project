import { Logger } from '@utils/logger';
import { WaitHelper } from '@helpers/WaitHelper';
import { ElementHelper } from '@helpers/ElementHelper';

/**
 * BasePage containing common methods shared across all Page Objects.
 */
export default class BasePage {
    /**
     * Navigates to a specific path relative to baseUrl.
     * @param path URL path (e.g., '/login')
     */
    public async open(path: string = ''): Promise<void> {
        try {
            Logger.info(`Navigating to: ${path || '/'}`);
            await browser.url(`/${path}`);
            // Wait for initial page load to settle
            await WaitHelper.waitForLoadingToDisappear();
            await this.acceptCookieBanner();
        } catch (error) {
            Logger.error(`Failed to navigate to path: ${path}`, error);
            throw error;
        }
    }

    /**
     * Reusable common header login button click.
     */
    public get btnHeaderLogin() { return $('#loginBtn'); }

    /**
     * Clicks the login button from the global header.
     */
    public async clickHeaderLogin(): Promise<void> {
        await ElementHelper.click(this.btnHeaderLogin, 'Global Header Login Button');
    }

    /**
     * Accepts the cookie consent banner if it is displayed.
     */
    public async acceptCookieBanner(): Promise<void> {
        try {
            const btnAcceptCookie = $('//button[contains(text(), "Accept") or contains(translate(text(), "ACCEPT", "accept"), "accept")] | //a[contains(text(), "Accept") or contains(translate(text(), "ACCEPT", "accept"), "accept")]');
            await btnAcceptCookie.waitForDisplayed({ timeout: 5000 });
            await btnAcceptCookie.click();
            Logger.info('Cookie banner accepted.');
            await browser.pause(1000); // Wait for banner to animate away
        } catch (e) {
            Logger.info('No cookie banner present or could not be clicked.');
        }
    }
}
