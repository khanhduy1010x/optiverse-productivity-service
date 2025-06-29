import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private logger;
    constructor();
    catch(exception: HttpException, host: ArgumentsHost): void;
}
