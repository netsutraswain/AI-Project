import BasePage from './BasePage';
import { ElementHelper } from '@helpers/ElementHelper';
import { WaitHelper } from '@helpers/WaitHelper';
import { Logger } from '@utils/logger';

class TroopSearchPage extends BasePage {
    /**
     * Define Locators
     * Replaced deeply nested absolute XPaths with simpler, context-aware selectors.
     */
    public get btnSearch() { return $('//button[contains(translate(text(), "search", "SEARCH"), "SEARCH") or @aria-label="SEARCH"]'); }
    
    public get inputZipCode() { return $('input[placeholder="Zip code"]'); }
    
    // Abstracting the specific troop selection button. 
    // In a real scenario, we might pass the troop name to find the exact button.
    public getTroopResult(index: number) { return $(`#troop-detail-data-${index}`); }
    // We must specifically click the "+" button for Girls, which is the first .btn-number with data-type="plus"
    public getBtnSelectTroop(index: number) { return $(`#troop-detail-data-${index} .input-group:first-of-type .btn-number[data-type="plus"]`); }
    public get btnAddDetails() { return $('*=ADD DETAILS'); }

    /**
     * Performs a default search and selects the first available troop.
     */
    public async searchAndSelectTroop(zipCode: string = '10001', troopIndex: number = 1): Promise<void> {
        Logger.info(`Searching for troops with zip code: ${zipCode}`);
        
        // Wait for the specific zip code input to render in the DOM
        const zipField = await $('input[placeholder="Zip code"]');
        await zipField.waitForDisplayed({ timeout: 15000 });
        
        // Simulate physical click and keystrokes to ensure Angular Reactive Forms detect the input
        await zipField.click();
        await browser.pause(500);
        await browser.keys(zipCode.split(''));
        await browser.pause(500);
        await browser.keys('Tab');
        Logger.info(`Typed Zip Code via physical keystrokes: ${zipCode}`);
        
        // Pause briefly to ensure Angular registers the input and enables the Search button
        await browser.pause(2000);
        
        // The UAT environment may now require a grade to be selected to enable the search button
        try {
            const gradeElements = await $$('//*[contains(text(), "10th grade") or contains(text(), "10th Grade")]');
            for (const el of gradeElements) {
                if (await el.isDisplayed() && await el.isEnabled()) {
                    await ElementHelper.click(el, '10th Grade Filter');
                    await browser.pause(1000);
                    break;
                }
            }
        } catch (e) {
            Logger.info('Could not select a grade filter, proceeding without it');
        }

        // Ensure the search button is ready before clicking
        await ElementHelper.click(this.btnSearch, 'Search Troops Button');
        
        // Wait for search results to load (UAT environment can be slow)
        await WaitHelper.waitForLoadingToDisappear();
        // Note: If UAT environment requires a Zip Code before searching, 
        // add the ElementHelper.setValue() here for the zip code input.
        await WaitHelper.waitForDisplayed(this.getTroopResult(troopIndex), 30000);
        
        // Select the troop
        await ElementHelper.click(this.getBtnSelectTroop(troopIndex), `Select Troop ${troopIndex} Button`);
        
        // Click Add Details to proceed to the registration form
        await ElementHelper.click(this.btnAddDetails, 'Add Details Button');
    }
}

export default new TroopSearchPage();
