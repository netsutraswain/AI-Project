import { Logger } from '@utils/logger';
import type { ChainablePromiseElement } from 'webdriverio';

export class WaitHelper {
    /**
     * Waits for an element to be displayed.
     * @param element The WebdriverIO element
     * @param timeout Optional timeout in ms
     */
    static async waitForDisplayed(element: ChainablePromiseElement<WebdriverIO.Element>, timeout = 10000): Promise<void> {
        const selector = element.selector;
        try {
            await element.waitForDisplayed({ timeout });
        } catch (error) {
            Logger.error(`Element with selector '${selector}' was not displayed within ${timeout}ms.`, error);
            throw error;
        }
    }

    /**
     * Waits for an element to be clickable.
     * @param element The WebdriverIO element
     * @param timeout Optional timeout in ms
     */
    static async waitForClickable(element: ChainablePromiseElement<WebdriverIO.Element>, timeout = 10000): Promise<void> {
        const selector = element.selector;
        try {
            await element.waitForClickable({ timeout });
        } catch (error) {
            Logger.error(`Element with selector '${selector}' was not clickable within ${timeout}ms.`, error);
            throw error;
        }
    }

    /**
     * Waits for an element to exist in the DOM.
     * @param element The WebdriverIO element
     * @param timeout Optional timeout in ms
     */
    static async waitForExist(element: ChainablePromiseElement<WebdriverIO.Element>, timeout = 10000): Promise<void> {
        const selector = element.selector;
        try {
            await element.waitForExist({ timeout });
        } catch (error) {
            Logger.error(`Element with selector '${selector}' did not exist in DOM within ${timeout}ms.`, error);
            throw error;
        }
    }

    /**
     * Custom wait mechanism to check if an angular-specific loading mask disappears, if applicable.
     */
    static async waitForLoadingToDisappear(timeout = 30000): Promise<void> {
        try {
            // Using a generic loading spinner/mask class. This could be customized based on exact application structure.
            const spinner = $('.loading-spinner, .overlay, .mat-progress-spinner');
            try {
                await spinner.waitForDisplayed({ timeout: 2000 });
                // If it becomes displayed, wait for it to disappear
                await spinner.waitForDisplayed({ timeout, reverse: true });
            } catch {
                // If it doesn't appear within 2 seconds, assume it's already gone
            }
        } catch (error) {
            Logger.warn(`Loading mask did not disappear within ${timeout}ms. Assuming page is ready or error occurred.`);
        }
    }
}
