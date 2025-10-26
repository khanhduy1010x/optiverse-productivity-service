"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosClientModule = void 0;
const common_1 = require("@nestjs/common");
const axios_client_1 = require("./axios-client");
const user_http_client_1 = require("./user-http.client");
const notification_http_client_1 = require("./notification-http.client");
let AxiosClientModule = class AxiosClientModule {
};
exports.AxiosClientModule = AxiosClientModule;
exports.AxiosClientModule = AxiosClientModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: 'AXIOS_CLIENT',
                useFactory: () => new axios_client_1.AxiosClient(''),
            },
            user_http_client_1.UserHttpClient,
            notification_http_client_1.NotificationHttpClient,
        ],
        exports: ['AXIOS_CLIENT', user_http_client_1.UserHttpClient, notification_http_client_1.NotificationHttpClient],
    })
], AxiosClientModule);
//# sourceMappingURL=axios-client.module.js.map