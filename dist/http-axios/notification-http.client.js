"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHttpClient = exports.ActionType = void 0;
const common_1 = require("@nestjs/common");
const axios_client_1 = require("./axios-client");
var ActionType;
(function (ActionType) {
    ActionType["TASK"] = "task";
    ActionType["NOTE"] = "note";
    ActionType["FLASHCARD"] = "flashcard";
    ActionType["CHAT"] = "chat";
    ActionType["FRIEND"] = "friend";
})(ActionType || (exports.ActionType = ActionType = {}));
let NotificationHttpClient = class NotificationHttpClient {
    constructor() {
        this.client = new axios_client_1.AxiosClient('http://notification-service:3002');
    }
    async sendEmail(to, subject, content, actionType, userId) {
        try {
            const response = await this.client.post('email/send-simple', {
                to,
                subject,
                content,
                actionType,
                userId,
            });
            return response.data;
        }
        catch (error) {
            console.error('Error sending email notification:', error);
            return null;
        }
    }
    async sendShareNotification(to, resourceType, resourceName, ownerName, permission, userId) {
        const subject = `You have been shared a ${resourceType === 'note' ? 'note' : 'folder'}`;
        const content = `
      ${ownerName} has shared the ${resourceType === 'note' ? 'note' : 'folder'} "${resourceName}" with you.\n
      You have ${permission === 'view' ? 'view' : 'edit'} permission for this resource.\n
      Please log in to the application to access it.
    `;
        return this.sendEmail(to, subject, content, ActionType.NOTE, userId);
    }
};
exports.NotificationHttpClient = NotificationHttpClient;
exports.NotificationHttpClient = NotificationHttpClient = __decorate([
    (0, common_1.Injectable)()
], NotificationHttpClient);
//# sourceMappingURL=notification-http.client.js.map