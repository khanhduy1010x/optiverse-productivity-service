import { HttpException } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';
export declare class AppException extends HttpException {
    private errorCode;
    constructor(errorCode: ErrorCode);
}
