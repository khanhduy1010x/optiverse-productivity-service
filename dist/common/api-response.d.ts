export declare class ApiResponse<T> {
    code: number;
    message: string;
    data: NonNullable<T> | null;
    constructor(data?: NonNullable<T> | null);
}
