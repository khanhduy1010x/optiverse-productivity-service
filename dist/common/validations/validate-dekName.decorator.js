"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidNicknameConstraint = void 0;
exports.IsValidNickname = IsValidNickname;
const class_validator_1 = require("class-validator");
const app_exception_1 = require("../exceptions/app.exception");
const error_code_enum_1 = require("../exceptions/error-code.enum");
let IsValidNicknameConstraint = class IsValidNicknameConstraint {
    constructor(errorCode) {
        this.errorCode = errorCode;
    }
    validate(deckName) {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!regex.test(deckName)) {
            throw new app_exception_1.AppException(this.errorCode);
        }
        return true;
    }
    defaultMessage() {
        return 'Nickname must be between 3 to 20 characters and can only contain letters, numbers, and underscores (_).';
    }
};
exports.IsValidNicknameConstraint = IsValidNicknameConstraint;
exports.IsValidNicknameConstraint = IsValidNicknameConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: false }),
    __metadata("design:paramtypes", [Number])
], IsValidNicknameConstraint);
function IsValidNickname(errorCode, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [errorCode],
            validator: new IsValidNicknameConstraint(errorCode),
        });
    };
}
//# sourceMappingURL=validate-dekName.decorator.js.map