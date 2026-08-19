import type { Options } from '@wdio/types';

const isCI = process.env.CI === 'true';

export const config: Options.Testrunner = {
    runner: 'local',

    // Do not let WDIO start Xvfb
    autoXvfb: false,

    automationProtocol: 'webdriver',

    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            project: './tsconfig.json',
            transpileOnly: true
        }
    },

    specs: [
        './test/specs/**/*.ts'
    ],

    exclude: [],

    maxInstances: 1,

    capabilities: [{
        browserName: 'chrome',

        'goog:chromeOptions': {
            args: isCI
                ? [
                    '--headless=new',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--window-size=1920,1080'
                ]
                : [
                    '--window-size=1920,1080'
                ]
        }
    }],

    logLevel: 'info',

    bail: 0,

    baseUrl: 'https://mygs-uat.girlscouts.org',

    waitforTimeout: 10000,

    connectionRetryTimeout: 120000,

    connectionRetryCount: 3,

    framework: 'mocha',

    reporters: [
        'spec',
        [
            'allure',
            {
                outputDir: 'allure-results',
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: false
            }
        ]
    ],

    mochaOpts: {
        ui: 'bdd',
        timeout: 1200000
    },

    afterTest: async function (test, context, { error }) {
        if (error) {
            await browser.takeScreenshot();
        }
    }
};