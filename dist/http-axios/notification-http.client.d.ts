export declare enum ActionType {
    TASK = "task",
    NOTE = "note",
    FLASHCARD = "flashcard",
    CHAT = "chat",
    FRIEND = "friend"
}
export declare class NotificationHttpClient {
    private readonly client;
    sendEmail(to: string, subject: string, content: string, actionType: ActionType, userId?: string): Promise<any>;
    sendShareNotification(to: string, resourceType: string, resourceName: string, ownerName: string, permission: string, userId?: string): Promise<any>;
}
