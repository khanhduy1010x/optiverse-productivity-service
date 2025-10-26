import { ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
import { ErrorCode } from '../exceptions/error-code.enum';
export declare class IsValidNicknameConstraint implements ValidatorConstraintInterface {
    private errorCode;
    constructor(errorCode: ErrorCode);
    validate(deckName: string): boolean;
    defaultMessage(): string;
}
export declare function IsValidNickname(errorCode: ErrorCode, validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
