"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston_1 = require("winston");
let LoggerService = LoggerService_1 = class LoggerService {
    static getLogger() {
        if (!LoggerService_1.logger) {
            LoggerService_1.logger = (0, winston_1.createLogger)({
                level: 'info',
                format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.colorize(), winston_1.format.printf((info) => {
                    const formattedTime = new Date(info.timestamp).toLocaleTimeString('en-GB', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        fractionalSecondDigits: 3,
                    });
                    return `${formattedTime} ${info.level}: ${info.message}`;
                })),
                transports: [
                    new winston_1.transports.Console({
                        level: 'info',
                    }),
                ],
            });
        }
        return LoggerService_1.logger;
    }
    static logAppStartup() {
        const logger = LoggerService_1.getLogger();
        logger.info('Application has started.');
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = LoggerService_1 = __decorate([
    (0, common_1.Injectable)()
], LoggerService);
//# sourceMappingURL=logger.service.js.map