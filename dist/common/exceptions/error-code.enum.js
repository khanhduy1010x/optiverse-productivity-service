"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorDetails = exports.ErrorCode = void 0;
const common_1 = require("@nestjs/common");
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["INVALID_CODE"] = 0] = "INVALID_CODE";
    ErrorCode[ErrorCode["UNCATEGORIZED_CODE"] = 1] = "UNCATEGORIZED_CODE";
    ErrorCode[ErrorCode["INVALID_USERNAME"] = 2] = "INVALID_USERNAME";
    ErrorCode[ErrorCode["NULL_USERNAME"] = 3] = "NULL_USERNAME";
    ErrorCode[ErrorCode["NULL_PASSWORD"] = 4] = "NULL_PASSWORD";
    ErrorCode[ErrorCode["INVALID_PASSWORD"] = 5] = "INVALID_PASSWORD";
    ErrorCode[ErrorCode["UNAUTHENTICATED"] = 6] = "UNAUTHENTICATED";
    ErrorCode[ErrorCode["UNAUTHORIZED"] = 7] = "UNAUTHORIZED";
    ErrorCode[ErrorCode["NOT_FOUND"] = 8] = "NOT_FOUND";
    ErrorCode[ErrorCode["SERVER_ERROR"] = 9] = "SERVER_ERROR";
    ErrorCode[ErrorCode["INVALID_DECKNAME"] = 10] = "INVALID_DECKNAME";
    ErrorCode[ErrorCode["MISSING_SECRET_KEY"] = 11] = "MISSING_SECRET_KEY";
    ErrorCode[ErrorCode["EMAIL_EXISTS"] = 12] = "EMAIL_EXISTS";
    ErrorCode[ErrorCode["VERIFY_TIME_OUT"] = 13] = "VERIFY_TIME_OUT";
    ErrorCode[ErrorCode["INVALID_OTP"] = 14] = "INVALID_OTP";
    ErrorCode[ErrorCode["WATTING_TIME_OTP"] = 15] = "WATTING_TIME_OTP";
    ErrorCode[ErrorCode["ACCOUNT_NOT_VERIFIED"] = 16] = "ACCOUNT_NOT_VERIFIED";
    ErrorCode[ErrorCode["EMAIL_EXISTS_NOT_VERIFY"] = 17] = "EMAIL_EXISTS_NOT_VERIFY";
    ErrorCode[ErrorCode["CURRENT_PASSWORD_NOT_MATCH"] = 18] = "CURRENT_PASSWORD_NOT_MATCH";
    ErrorCode[ErrorCode["INVALID_TOKEN_GOOGLE"] = 19] = "INVALID_TOKEN_GOOGLE";
    ErrorCode[ErrorCode["ACCOUNT_IS_LOGOUT"] = 20] = "ACCOUNT_IS_LOGOUT";
    ErrorCode[ErrorCode["MISSING_ACCESS_TOKEN"] = 21] = "MISSING_ACCESS_TOKEN";
    ErrorCode[ErrorCode["RESOURCE_NOT_FOUND"] = 22] = "RESOURCE_NOT_FOUND";
    ErrorCode[ErrorCode["PERMISSION_DENIED"] = 23] = "PERMISSION_DENIED";
    ErrorCode[ErrorCode["INVALID_RESOURCE_TYPE"] = 24] = "INVALID_RESOURCE_TYPE";
    ErrorCode[ErrorCode["SHARE_NOT_FOUND"] = 25] = "SHARE_NOT_FOUND";
    ErrorCode[ErrorCode["UPDATE_SHARE_FAILED"] = 26] = "UPDATE_SHARE_FAILED";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
exports.ErrorDetails = {
    [ErrorCode.INVALID_CODE]: {
        code: 1000,
        message: 'Invalid code',
        httpStatus: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
    },
    [ErrorCode.UNCATEGORIZED_CODE]: {
        code: 9999,
        message: 'Uncategorized error',
        httpStatus: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
    },
    [ErrorCode.INVALID_USERNAME]: {
        code: 1001,
        message: 'Username must be between 6 - 25 characters',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.NULL_USERNAME]: {
        code: 1002,
        message: 'Username must not be null',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.NULL_PASSWORD]: {
        code: 1003,
        message: 'Password must not be null',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.INVALID_PASSWORD]: {
        code: 1004,
        message: 'Password must have at least 8 characters with uppercase, lowercase, number, and special character',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.UNAUTHENTICATED]: {
        code: 1005,
        message: 'Unauthenticated',
        httpStatus: common_1.HttpStatus.UNAUTHORIZED,
    },
    [ErrorCode.UNAUTHORIZED]: {
        code: 1006,
        message: 'You do not have permission',
        httpStatus: common_1.HttpStatus.FORBIDDEN,
    },
    [ErrorCode.NOT_FOUND]: {
        code: 1007,
        message: 'Resource not found',
        httpStatus: common_1.HttpStatus.NOT_FOUND,
    },
    [ErrorCode.SERVER_ERROR]: {
        code: 1008,
        message: 'Internal server error',
        httpStatus: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
    },
    [ErrorCode.INVALID_DECKNAME]: {
        code: 1009,
        message: 'Invalid DeckName',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.MISSING_SECRET_KEY]: {
        code: 1010,
        message: 'Missing JWT_SECRET in environment variables',
        httpStatus: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
    },
    [ErrorCode.EMAIL_EXISTS]: {
        code: 1011,
        message: 'Email exists & verified',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.VERIFY_TIME_OUT]: {
        code: 1012,
        message: 'Email verify is time out',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.INVALID_OTP]: {
        code: 1013,
        message: 'Invalid OTP',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.WATTING_TIME_OTP]: {
        code: 1014,
        message: 'Watting for next send OTP',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACCOUNT_NOT_VERIFIED]: {
        code: 1015,
        message: 'Account is unverify',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.EMAIL_EXISTS_NOT_VERIFY]: {
        code: 1016,
        message: 'Email is exits but not verify',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.CURRENT_PASSWORD_NOT_MATCH]: {
        code: 1017,
        message: 'Current password not match',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.INVALID_TOKEN_GOOGLE]: {
        code: 1018,
        message: 'Invalid token google',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACCOUNT_IS_LOGOUT]: {
        code: 1019,
        message: 'Account is log out',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.MISSING_ACCESS_TOKEN]: {
        code: 1020,
        message: 'Missing access token',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.RESOURCE_NOT_FOUND]: {
        code: 1021,
        message: 'Resource not found',
        httpStatus: common_1.HttpStatus.NOT_FOUND,
    },
    [ErrorCode.PERMISSION_DENIED]: {
        code: 1022,
        message: 'You do not have permission to share this resource',
        httpStatus: common_1.HttpStatus.FORBIDDEN,
    },
    [ErrorCode.INVALID_RESOURCE_TYPE]: {
        code: 1023,
        message: 'Invalid resource type',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.SHARE_NOT_FOUND]: {
        code: 1024,
        message: 'Share not found',
        httpStatus: common_1.HttpStatus.NOT_FOUND,
    },
    [ErrorCode.UPDATE_SHARE_FAILED]: {
        code: 1025,
        message: 'Failed to update share',
        httpStatus: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
    },
};
//# sourceMappingURL=error-code.enum.js.map