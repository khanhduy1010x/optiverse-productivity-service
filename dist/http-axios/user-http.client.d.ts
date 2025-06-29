interface UserResponse {
    user_id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}
export declare class UserHttpClient {
    private readonly client;
    getUser(email: string): Promise<any>;
    getUsersByIds(userIds: string[]): Promise<UserResponse[]>;
}
export {};
