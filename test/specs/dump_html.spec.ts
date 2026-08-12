import { browser } from '@wdio/globals';
import LoginPage from '../pageobjects/LoginPage';
import loginData from '../data/login.json';
import * as fs from 'fs';

describe('Dump HTML', () => {
    it('should dump HTML of the search page', async () => {
        await LoginPage.open();
        await LoginPage.clickHeaderLogin();
        
        // Use existing login logic
        await LoginPage.login(loginData.validUser.username, loginData.validUser.password);
        
        // Wait for login to complete and dashboard to load
        await browser.waitUntil(
            async () => {
                const url = await browser.getUrl();
                return url.includes('household') || url.includes('dashboard') || url.includes('my-account');
            },
            { timeout: 30000, timeoutMsg: 'Dashboard did not load after login' }
        );
        
        // Navigate to search page
        await browser.url('https://mygs-uat.girlscouts.org/search;type=NEW_MEMBER');
        await browser.pause(10000); // Wait 10 seconds for the search page to load
        
        const html = await browser.getPageSource();
        fs.writeFileSync('d:\\AI Project\\search_page_dump.html', html);
        console.log('HTML Dumped to search_page_dump.html');
    });
});
