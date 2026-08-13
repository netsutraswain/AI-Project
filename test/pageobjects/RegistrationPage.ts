import BasePage from './BasePage';
import { ElementHelper } from '@helpers/ElementHelper';
import { WaitHelper } from '@helpers/WaitHelper';

class RegistrationPage extends BasePage {
    /**
     * Define Locators
     */
    
    // Girl Details
    public get inputFirstName() { return $('input[formcontrolname="firstName"], input[placeholder*="First Name" i], input[placeholder*="first name" i]'); }
    public get inputLastName() { return $('input[formcontrolname="lastName"], input[placeholder*="Last Name" i], input[placeholder*="last name" i]'); }
    
    // Dropdowns
    public get dropdownEthnicity() { return $('ng-select[formcontrolname="ethnicity"], ng-select[placeholder*="Ethnicity" i], [aria-label*="Ethnicity" i]'); }
    public get dropdownRace() { return $('ng-select[formcontrolname="race"], ng-select[placeholder*="Race" i], [aria-label*="Race" i]'); }
    public get dropdownGrade() { return $('ng-select[formcontrolname="grade"] .ng-select-container, ng-select[placeholder*="Grade" i] .ng-select-container, [aria-label*="Grade" i] .ng-select-container'); }
    public get dropdownParticipationType() { return $('ng-select[formcontrolname="participationType"] .ng-select-container, ng-select[placeholder*="Participation" i] .ng-select-container, [aria-label*="Participation" i] .ng-select-container'); }
    public get dropdownTroop() { return $('ng-select[formcontrolname="troops"] .ng-select-container, ng-select[formcontrolname="troop"] .ng-select-container, ng-select[placeholder*="Troop" i] .ng-select-container, [aria-label*="Troop" i] .ng-select-container'); }
    
    // Date of Birth
    public get inputDob() { return $('input[placeholder*="MM/DD/YYYY" i], input[formcontrolname="dateOfBirth"]'); }
    
    // School
    public get inputSchool() { return $('input[formcontrolname="school"], input[placeholder*="School Attending" i], [aria-label*="School Attending" i]'); }
    
    // Contact Info (Caregiver)
    public get chkIAmCaregiver() { return $('label[for="isCaregiver"]'); }
    public get inputCaregiverFirstName() { return $('aria/Caregiver first name'); }
    public get inputCaregiverLastName() { return $('aria/Caregiver last name'); }
    public get inputCaregiverEmail() { return $('input[placeholder*="Caregiver email" i], input[formcontrolname="email"]'); }
    public get inputCaregiverPhone() { return $('input[placeholder*="Caregiver Phone" i], input[formcontrolname="phoneNumber"]'); }
    public get dropdownCaregiverPhoneType() { return $('ng-select[placeholder*="Phone type" i]'); }
    public get dropdownCaregiverGender() { return $('ng-select[placeholder*="Gender" i], ng-select[formcontrolname="gender"]'); }
    public get dropdownRelationship() { return $('ng-select[formcontrolname="relationship"], ng-select[placeholder*="relationship" i]'); }
    public get inputEmergencyContact() { return $('input[formcontrolname="emergencyContact"]'); }

    // Address Details
    public get inputZipCode() { return $('input[formcontrolname="zipCode"], input[placeholder*="Zip" i]'); }
    public get inputCity() { return $('input[formcontrolname="city"], input[placeholder*="City" i]'); }
    public get dropdownState() { return $('ng-select[formcontrolname="state"], ng-select[placeholder*="State" i]'); }
    public get inputCountry() { return $('ng-select[formcontrolname="country"], #country'); }
    public get inputAddressLine1() { return $('input[formcontrolname="addressLine1"], input[placeholder*="Address" i]'); }

    // Buttons
    public get btnContinue() { return $('//button[contains(translate(text(), "continue", "CONTINUE"), "CONTINUE") or contains(@aria-label, "CONTINUE") or contains(translate(text(), "save", "SAVE"), "SAVE")]'); }

    /**
     * Fills out the basic girl details form.
     */
    public async fillGirlDetails(data: any): Promise<void> {
        await browser.waitUntil(async () => {
            const firstNames = await $$('input[formcontrolname="firstName"], input[placeholder*="First Name" i], input[placeholder*="first name" i]');
            for (let i = firstNames.length - 1; i >= 0; i--) {
                if (await firstNames[i].isDisplayed()) return true;
            }
            return false;
        }, { timeout: 30000, timeoutMsg: 'No visible First Name input found after 30s' });
        
        const firstNames = await $$('input[formcontrolname="firstName"], input[placeholder*="First Name" i], input[placeholder*="first name" i]');
        for (let i = 0; i < firstNames.length; i++) {
            if (await firstNames[i].isDisplayed() && await firstNames[i].isEnabled()) {
                await ElementHelper.setValue(firstNames[i], data.firstName, 'First Name Input');
                break;
            }
        }

        const lastNames = await $$('input[formcontrolname="lastName"], input[placeholder*="Last Name" i], input[placeholder*="last name" i]');
        for (let i = 0; i < lastNames.length; i++) {
            if (await lastNames[i].isDisplayed() && await lastNames[i].isEnabled()) {
                await ElementHelper.setValue(lastNames[i], data.lastName, 'Last Name Input');
                break;
            }
        }
        
        if (data.grade) {
            const gradeDropdowns = await $$('ng-select[formcontrolname="grade"], ng-select[placeholder*="Grade" i], [aria-label*="Grade" i]');
            for (const dp of gradeDropdowns) {
                if (await dp.isDisplayed()) {
                    await ElementHelper.click(dp, 'Grade Dropdown');
                    await browser.pause(1000);
                    const gradeOption = $(`.ng-option*=${data.grade}`);
                    await ElementHelper.click(gradeOption, `Grade: ${data.grade}`);
                    await browser.pause(1000);
                    break;
                }
            }
            
            const partDropdowns = await $$('ng-select[formcontrolname="participationType"], ng-select[placeholder*="Participation" i], [aria-label*="Participation" i]');
            for (const dp of partDropdowns) {
                if (await dp.isDisplayed()) {
                    await ElementHelper.click(dp, 'Participation Type Dropdown');
                    await browser.pause(500);
                    await ElementHelper.click($('.ng-option*=Troop Member'), 'Participation Type: Troop Member');
                    break;
                }
            }
            
            const troopDropdowns = await $$('ng-select[formcontrolname="troops"], ng-select[formcontrolname="troop"], ng-select[placeholder*="Troop" i], [aria-label*="Troop" i]');
            for (const dp of troopDropdowns) {
                if (await dp.isDisplayed()) {
                    await ElementHelper.click(dp, 'Troop Dropdown');
                    await browser.pause(500);
                    await ElementHelper.click($('.ng-option*=Troop'), 'Troop Selection');
                    break;
                }
            }
        }
        
        const ethnicityDropdowns = await $$('ng-select[formcontrolname="ethnicity"] .ng-select-container, ng-select[placeholder*="Ethnicity" i] .ng-select-container, [aria-label*="Ethnicity" i] .ng-select-container');
        for (const dp of ethnicityDropdowns) {
            if (await dp.isDisplayed()) {
                await ElementHelper.click(dp, 'Ethnicity Dropdown');
                await browser.pause(500);
                await ElementHelper.click($('.ng-option'), 'Ethnicity Option (First Available)');
                break;
            }
        }
        
        const raceDropdowns = await $$('ng-select[formcontrolname="race"] .ng-select-container, ng-select[placeholder*="Race" i] .ng-select-container, [aria-label*="Race" i] .ng-select-container');
        for (const dp of raceDropdowns) {
            if (await dp.isDisplayed()) {
                await ElementHelper.click(dp, 'Race Dropdown');
                await browser.pause(500);
                await ElementHelper.click($('.ng-option'), 'Race Option (First Available)');
                break;
            }
        }
        
        const dobInputs = await $$('input[placeholder*="MM/DD/YYYY" i], input[formcontrolname="dateOfBirth"]');
        for (const dp of dobInputs) {
            if (await dp.isDisplayed() && await dp.isEnabled()) {
                // UAT expects a raw string here now instead of the old picker.
                await ElementHelper.setValue(dp, '06/04/2010', 'DOB Input');
                break;
            }
        }

        // Aggressive School Search and Fill
        const cssSchoolInputs = await $$('input[placeholder*="School" i], [aria-label*="School" i], input[formcontrolname*="school" i], ng-select[placeholder*="School" i]');
        const xpathSchoolInputs = await $$('//*[contains(text(), "School Attending")]/ancestor::div[contains(@class, "col") or contains(@class, "form-group") or contains(@class, "field")]//input[not(@type="hidden")]');
        const schoolInputs = [...cssSchoolInputs, ...xpathSchoolInputs];
        if (schoolInputs.length > 0) {
            // Pick the first one that is actually displayed
            for (const input of schoolInputs) {
                if (await input.isDisplayed()) {
                    const tagName = (await input.getTagName()).toLowerCase();
                    const parentTagName = (await (await input.$('..')).getTagName()).toLowerCase();
                    const grandParentTagName = (await (await input.$('../..')).getTagName()).toLowerCase();
                    
                    if (tagName === 'ng-select' || parentTagName === 'ng-select' || grandParentTagName === 'ng-select') {
                        const ngSelect = tagName === 'ng-select' ? input : (parentTagName === 'ng-select' ? await input.$('..') : await input.$('../..'));
                        await ElementHelper.selectNgSelectOption(ngSelect, 'Home', 'School Attending');
                    } else {
                        await input.click();
                        await browser.pause(500);
                        await input.setValue(''); // clear
                        
                        const textToType = 'Home';
                        for (let i = 0; i < textToType.length; i++) {
                            await input.addValue(textToType[i]);
                            await browser.pause(200);
                        }
                        await browser.pause(3000); // wait for network
                        

                        
                        let clicked = false;
                        const options = await $$('a*=Home');
                        for (const opt of options) {
                            try {
                                if (await opt.isDisplayed()) {
                                    await opt.click();
                                    clicked = true;
                                    break;
                                }
                            } catch (e) {}
                        }
                        
                        if (!clicked) {
                            const liOptions = await $$('li*=Home');
                            for (const opt of liOptions) {
                                try {
                                    if (await opt.isDisplayed()) {
                                        await opt.click();
                                        clicked = true;
                                        break;
                                    }
                                } catch (e) {}
                            }
                        }
                        
                        if (!clicked) {
                            await browser.keys(['ArrowDown', 'Enter', 'Tab']);
                        }
                    }
                    
                    console.log(`Successfully set school value`);
                    break;
                }
            }
        }
        
        await WaitHelper.waitForLoadingToDisappear();
    }

    /**
     * Fills out address details using the custom app-address-form component.
     */
    public async fillAddress(addressData: any): Promise<void> {
        // Wait for at least one zip code field to be actually visible on the screen, 
        // bypassing hidden fields from stale participants in the cart
        await browser.waitUntil(async () => {
            const zips = await $$('input[formcontrolname="zipCode"], input[placeholder*="Zip" i]');
            for (let i = zips.length - 1; i >= 0; i--) {
                if (await zips[i].isDisplayed()) return true;
            }
            return false;
        }, { timeout: 30000, timeoutMsg: 'No visible zip code input found after 30s' });

        // Zip and City
        const zips = await $$('input[formcontrolname="zipCode"], input[placeholder*="Zip" i]');
        for (const zip of zips) { if (await zip.isDisplayed() && await zip.isEnabled()) { await ElementHelper.setValue(zip, addressData.zipCode, 'Zip Code'); break; } }
        
        const cities = await $$('input[formcontrolname="city"], input[placeholder*="City" i]');
        for (const city of cities) { if (await city.isDisplayed() && await city.isEnabled()) { await ElementHelper.setValue(city, addressData.city, 'City'); break; } }
        
        // State
        const states = await $$('ng-select[formcontrolname="state"], ng-select[placeholder*="State" i]');
        for (const state of states) {
            if (await state.isDisplayed() && await state.isEnabled()) {
                await ElementHelper.click(state, 'State Dropdown');
                await browser.pause(500);
                
                const options = await $$('.ng-option, mat-option, li[role="option"]');
                if (options.length > 0) {
                    for (const opt of options) {
                        if (await opt.isDisplayed() && await opt.isEnabled()) {
                            await ElementHelper.click(opt, 'State Option (First Available)');
                            break;
                        }
                    }
                }
                break;
            }
        }

        // Country
        if (await this.inputCountry.isDisplayed()) {
            await ElementHelper.click(this.inputCountry, 'Country Dropdown');
            await browser.pause(500);
            const countryOption = $(`//*[contains(text(), "${addressData.country}")]`);
            if (await countryOption.isExisting()) {
                await ElementHelper.click(countryOption, `Country: ${addressData.country}`);
            }
        }
        
        // Address Line 1
        const addrs = await $$('input[formcontrolname="addressLine1"], input[placeholder*="Address" i], input[placeholder*="address line 1" i]');
        for (const addr of addrs) {
            if (await addr.isDisplayed() && await addr.isEnabled()) {
                await ElementHelper.setValue(addr, addressData.addressLine1, 'Address Line 1');
                break;
            }
        }
    }

    /**
     * Fills Caregiver details and Address details if necessary.
     */
    public async fillCaregiverDetails(cgData: any, addressData: any, phone: string): Promise<void> {
        if (await this.inputCaregiverFirstName.isDisplayed()) {
            await ElementHelper.setValue(this.inputCaregiverFirstName, cgData.firstName, 'Caregiver First Name');
            await ElementHelper.setValue(this.inputCaregiverLastName, cgData.lastName, 'Caregiver Last Name');
        }
        await ElementHelper.setValue(this.inputCaregiverEmail, cgData.email, 'Caregiver Email');
        await ElementHelper.setValue(this.inputCaregiverPhone, phone, 'Phone Number');
        
        // Aggressive Helper to interact with any type of dropdown component
        const aggressiveDropdownSelect = async (identifiers: string[], dropdownName: string) => {
            const dropdowns = await $$(identifiers.join(', '));
            for (const dd of dropdowns) {
                if (await dd.isDisplayed() && await dd.isEnabled()) {
                    const tagName = (await dd.getTagName()).toLowerCase();
                    if (tagName === 'select') {
                        try { await dd.selectByIndex(1); } catch (e) { console.log(`Could not selectByIndex for ${dropdownName}`); }
                    } else {
                        await ElementHelper.click(dd, dropdownName);
                        await browser.pause(500);
                        const options = await $$('.ng-option, mat-option, li[role="option"]');
                        if (options.length > 0) {
                            // Click the last option to guarantee we don't click a disabled placeholder
                            for (let i = options.length - 1; i >= 0; i--) {
                                if (await options[i].isDisplayed() && await options[i].isEnabled()) {
                                    await ElementHelper.click(options[i], `${dropdownName} Option`);
                                    break;
                                }
                            }
                        } else {
                            const nativeOptions = await dd.$$('option');
                            if (nativeOptions.length > 1) {
                                await ElementHelper.click(nativeOptions[1], `${dropdownName} Native Option`);
                            }
                        }
                    }
                }
            }
        };

        // Use the exact ID patterns discovered from the DOM dump
        await aggressiveDropdownSelect(['[id*="phoneTypeCG" i]'], 'Caregiver Phone Type');
        await aggressiveDropdownSelect(['[id*="genderCG" i]'], 'Caregiver Gender');
        await aggressiveDropdownSelect(['[id*="relationshipCG" i]'], 'Caregiver Relationship');

        // Caregiver Date of Birth (recently made mandatory in UAT)
        const dobs = await $$('input[placeholder*="MM/DD/YYYY" i], input[formcontrolname*="dateOfBirth" i], [aria-label*="Birth date" i]');
        if (dobs.length > 0) {
            // Pick the last visible DOB field, which should be the Caregiver's (Girl's is first)
            for (let i = dobs.length - 1; i >= 0; i--) {
                if (await dobs[i].isDisplayed() && await dobs[i].isEnabled()) {
                    await ElementHelper.setValue(dobs[i], '01/01/1980', 'Caregiver DOB');
                    break;
                }
            }
        }

        // Check the "Caregiver has same address as Girl" box so we don't have to fill the address again!
        const chkSameAddress = await $('*=same address as Girl');
        if (await chkSameAddress.isDisplayed()) {
            await ElementHelper.click(chkSameAddress, 'Same Address as Girl Checkbox');
            await browser.pause(500);
        } else {
            // Fallback just in case
            if (await this.inputAddressLine1.isDisplayed() && await this.inputAddressLine1.isEnabled()) {
                await ElementHelper.setValue(this.inputAddressLine1, addressData.addressLine1, 'Caregiver Address Line 1');
                await ElementHelper.setValue(this.inputZipCode, addressData.zipCode, 'Caregiver Zip Code');
                await ElementHelper.setValue(this.inputCity, addressData.city, 'Caregiver City');
                // State
                if (await this.dropdownState.isDisplayed()) {
                    await ElementHelper.click(this.dropdownState, 'State Dropdown');
                    await browser.pause(500);
                    const stateOption = $(`//*[contains(text(), "${addressData.state}")]`);
                    if (await stateOption.isExisting()) {
                        await ElementHelper.click(stateOption, `State: ${addressData.state}`);
                    }
                }
            }
        }
    }

    /**
     * Proceeds to next section
     */
    public async clickContinue(): Promise<void> {
        await ElementHelper.click(this.btnContinue, 'Continue / Save Button');
        await WaitHelper.waitForLoadingToDisappear();
    }
}

export default new RegistrationPage();
