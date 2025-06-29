import { ExceptionFilter, ArgumentsHost, BadRequestException } from '@nestjs/common';
export declare class AppExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost): void;
}
