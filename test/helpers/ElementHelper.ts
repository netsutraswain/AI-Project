import { WaitHelper } from './WaitHelper';
import { Logger } from '@utils/logger';
import type { ChainablePromiseElement } from 'webdriverio';

export class ElementHelper {
    /**
     * Safely clicks an element with retry mechanism and scrolling.
     */
    static async click(element: ChainablePromiseElement<WebdriverIO.Element>, elementName: string): Promise<void> {
        try {
            await WaitHelper.waitForLoadingToDisappear();
            await WaitHelper.waitForDisplayed(element);
            await element.scrollIntoView({ block: 'center', inline: 'center' });
            
            try {
                await WaitHelper.waitForClickable(element);
                await element.click();
            } catch (clickError) {
                Logger.warn(`Standard click failed for ${elementName}, attempting JS click fallback.`);
                await browser.execute('arguments[0].click();', await element);
            }
            
            Logger.info(`Clicked on: ${elementName}`);
        } catch (error) {
            Logger.error(`Failed to click on element: ${elementName}`, error);
            throw error;
        }
    }

    /**
     * Safely sets value to an input field after clearing it.
     */
    static async setValue(element: ChainablePromiseElement<WebdriverIO.Element>, value: string | number, elementName: string): Promise<void> {
        try {
            await WaitHelper.waitForDisplayed(element);
            await element.scrollIntoView({ block: 'center', inline: 'center' });
            
            await element.setValue(value);
            // Redact sensitive data from logs, assuming "password" or "cc" in elementName means sensitive
            const isSensitive = elementName.toLowerCase().includes('password') || elementName.toLowerCase().includes('cvv') || elementName.toLowerCase().includes('card');
            const logValue = isSensitive ? '********' : value;
            
            Logger.info(`Entered '${logValue}' into: ${elementName}`);
        } catch (error) {
            Logger.error(`Failed to set value on element: ${elementName}`, error);
            throw error;
        }
    }

    /**
     * Gets text from an element safely.
     */
    static async getText(element: ChainablePromiseElement<WebdriverIO.Element>, elementName: string): Promise<string> {
        try {
            await WaitHelper.waitForDisplayed(element);
            const text = await element.getText();
            Logger.info(`Got text '${text}' from: ${elementName}`);
            return text;
        } catch (error) {
            Logger.error(`Failed to get text from element: ${elementName}`, error);
            throw error;
        }
    }

    /**
     * Selects an option from a standard <select> dropdown by visible text.
     */
    static async selectByVisibleText(element: ChainablePromiseElement<WebdriverIO.Element>, text: string, elementName: string): Promise<void> {
        try {
            await WaitHelper.waitForDisplayed(element);
            await element.scrollIntoView({ block: 'center', inline: 'center' });
            await element.selectByVisibleText(text);
            Logger.info(`Selected '${text}' from dropdown: ${elementName}`);
        } catch (error) {
            Logger.error(`Failed to select '${text}' from dropdown: ${elementName}`, error);
            throw error;
        }
    }

    /**
     * Handles custom Angular ng-select dropdowns.
     * Clicks the dropdown, waits for the panel, and selects the option containing the text.
     */
    static async selectNgSelectOption(dropdownElement: ChainablePromiseElement<WebdriverIO.Element>, optionText: string, dropdownName: string): Promise<void> {
        try {
            await this.click(dropdownElement, dropdownName);
            
            // Wait for the ng-dropdown-panel to appear and settle
            const dropdownPanel = $('.ng-dropdown-panel');
            await WaitHelper.waitForDisplayed(dropdownPanel);

            // Find the option by text and click it
            const option = dropdownPanel.$(`//div[@role="option"]//span[contains(text(), "${optionText}")] | //div[@role="option"][contains(., "${optionText}")]`);
            await WaitHelper.waitForDisplayed(option);
            
            // Native click might be intercepted in complex DOMs, fall back to standard click
            await option.click();
            Logger.info(`Selected '${optionText}' from ng-select: ${dropdownName}`);
        } catch (error) {
            Logger.error(`Failed to select ng-select option '${optionText}' on ${dropdownName}`, error);
            throw error;
        }
    }
}
