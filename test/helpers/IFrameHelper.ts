import { Logger } from '@utils/logger';
import { WaitHelper } from './WaitHelper';
import type { ChainablePromiseElement } from 'webdriverio';

export class IFrameHelper {
    /**
     * Safely switches into an iframe after ensuring it exists and is displayed.
     * @param iframeElement The WebdriverIO element representing the iframe
     * @param iframeName A descriptive name for logging
     */
    static async switchToFrame(iframeElement: ChainablePromiseElement<WebdriverIO.Element>, iframeName: string): Promise<void> {
        try {
            await WaitHelper.waitForExist(iframeElement);
            
            await browser.switchFrame(await iframeElement);
            Logger.info(`Switched context to iframe: ${iframeName}`);
        } catch (error) {
            Logger.error(`Failed to switch to iframe: ${iframeName}`, error);
            throw error;
        }
    }

    /**
     * Switches back to the main document context (parent frame).
     */
    static async switchToMainContext(): Promise<void> {
        try {
            await browser.switchFrame(null);
            Logger.info('Switched context back to main document');
        } catch (error) {
            Logger.error('Failed to switch back to main document', error);
            throw error;
        }
    }

    /**
     * Executes an action inside an iframe and automatically returns to the main context.
     * @param iframeElement The WebdriverIO element representing the iframe
     * @param iframeName A descriptive name for logging
     * @param action Callback function containing the actions to execute inside the iframe
     */
    static async performActionInFrame(
        iframeElement: ChainablePromiseElement<WebdriverIO.Element>, 
        iframeName: string, 
        action: () => Promise<void>
    ): Promise<void> {
        try {
            await this.switchToFrame(iframeElement, iframeName);
            await action();
        } finally {
            // Guarantee that we always return to the main context even if the action fails
            await this.switchToMainContext();
        }
    }
}
