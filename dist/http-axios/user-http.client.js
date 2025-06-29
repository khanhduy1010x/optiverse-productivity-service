"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserHttpClient = void 0;
const common_1 = require("@nestjs/common");
const axios_client_1 = require("./axios-client");
let UserHttpClient = class UserHttpClient {
    constructor() {
        this.client = new axios_client_1.AxiosClient('http://core-service:3000');
    }
    async getUser(email) {
        const response = await this.client.get(`auth/get-info-by-email/${email}`);
        return response.data;
    }
    async getUsersByIds(userIds) {
        const response = await this.client.post('auth/get-users-by-ids', { userIds });
        if (response?.data?.data) {
            return response.data.data;
        }
        return [];
    }
};
exports.UserHttpClient = UserHttpClient;
exports.UserHttpClient = UserHttpClient = __decorate([
    (0, common_1.Injectable)()
], UserHttpClient);
//# sourceMappingURL=user-http.client.js.map