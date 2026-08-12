import winston from 'winston';
import allure from '@wdio/allure-reporter';
import fs from 'fs';

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

/**
 * Enterprise Logger using Winston.
 * Writes to both Console (colorized) and File.
 * Simultaneously attaches logs as Steps in Allure Reports.
 */
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                customFormat
            )
        }),
        new winston.transports.File({ 
            filename: `${logDir}/automation.log`,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ]
});

export class Logger {
    static info(message: string) {
        logger.info(message);
        try {
            allure.addStep(message);
        } catch (e) {
            // Ignore if Allure reporter isn't initialized yet
        }
    }

    static error(message: string, error?: Error | unknown) {
        const errorMsg = error instanceof Error ? `${message} - ${error.message}\n${error.stack}` : message;
        logger.error(errorMsg);
        try {
            allure.addStep(`ERROR: ${message}`, undefined, 'failed');
        } catch (e) {
             // Ignore
        }
    }

    static warn(message: string) {
        logger.warn(message);
    }
}
