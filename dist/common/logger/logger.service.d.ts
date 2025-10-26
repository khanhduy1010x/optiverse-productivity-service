import { Logger } from 'winston';
export declare class LoggerService {
    private static logger;
    static getLogger(): Logger;
    static logAppStartup(): void;
}
