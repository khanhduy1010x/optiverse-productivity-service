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
    ErrorCode[ErrorCode["INVALID_OBJECT_ID"] = 27] = "INVALID_OBJECT_ID";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_TITLE"] = 28] = "ACHIEVEMENT_INVALID_TITLE";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_LOGIC_OPERATOR"] = 29] = "ACHIEVEMENT_INVALID_LOGIC_OPERATOR";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_RULES_FORMAT"] = 30] = "ACHIEVEMENT_INVALID_RULES_FORMAT";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_RULE_CATEGORY"] = 31] = "ACHIEVEMENT_INVALID_RULE_CATEGORY";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_RULE_FIELD"] = 32] = "ACHIEVEMENT_INVALID_RULE_FIELD";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_RULE_VALUE_TYPE"] = 33] = "ACHIEVEMENT_INVALID_RULE_VALUE_TYPE";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_RULE_OPERATOR"] = 34] = "ACHIEVEMENT_INVALID_RULE_OPERATOR";
    ErrorCode[ErrorCode["ACHIEVEMENT_MISSING_THRESHOLD"] = 35] = "ACHIEVEMENT_MISSING_THRESHOLD";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_DATE_VALUE"] = 36] = "ACHIEVEMENT_INVALID_DATE_VALUE";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_NUMBER_VALUE"] = 37] = "ACHIEVEMENT_INVALID_NUMBER_VALUE";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_BOOLEAN_VALUE"] = 38] = "ACHIEVEMENT_INVALID_BOOLEAN_VALUE";
    ErrorCode[ErrorCode["ACHIEVEMENT_INVALID_VALUE"] = 39] = "ACHIEVEMENT_INVALID_VALUE";
    ErrorCode[ErrorCode["ACHIEVEMENT_MISSING_USER_ID"] = 40] = "ACHIEVEMENT_MISSING_USER_ID";
    ErrorCode[ErrorCode["FRAME_TITLE_REQUIRED"] = 41] = "FRAME_TITLE_REQUIRED";
    ErrorCode[ErrorCode["FRAME_TITLE_TOO_SHORT"] = 42] = "FRAME_TITLE_TOO_SHORT";
    ErrorCode[ErrorCode["FRAME_TITLE_TOO_LONG"] = 43] = "FRAME_TITLE_TOO_LONG";
    ErrorCode[ErrorCode["FRAME_NOT_FOUND"] = 44] = "FRAME_NOT_FOUND";
    ErrorCode[ErrorCode["FRAME_INVALID_ID"] = 45] = "FRAME_INVALID_ID";
    ErrorCode[ErrorCode["FRAME_UPLOAD_FAILED"] = 46] = "FRAME_UPLOAD_FAILED";
    ErrorCode[ErrorCode["FRAME_INVALID_FILE_TYPE"] = 47] = "FRAME_INVALID_FILE_TYPE";
    ErrorCode[ErrorCode["FRAME_FILE_TOO_LARGE"] = 48] = "FRAME_FILE_TOO_LARGE";
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
    [ErrorCode.INVALID_OBJECT_ID]: {
        code: 1026,
        message: 'Invalid ObjectId format',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_TITLE]: {
        code: 1100,
        message: 'Invalid achievement title',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_LOGIC_OPERATOR]: {
        code: 1101,
        message: 'Invalid logic operator',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_RULES_FORMAT]: {
        code: 1102,
        message: 'Invalid rules format. Must be an array of rules',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_RULE_CATEGORY]: {
        code: 1103,
        message: 'Invalid rule category',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_RULE_FIELD]: {
        code: 1104,
        message: 'Invalid rule field',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_RULE_VALUE_TYPE]: {
        code: 1105,
        message: 'Invalid rule value type',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_RULE_OPERATOR]: {
        code: 1106,
        message: 'Invalid rule operator',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_MISSING_THRESHOLD]: {
        code: 1107,
        message: 'Missing or invalid threshold for STRING/NUMBER type',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_DATE_VALUE]: {
        code: 1108,
        message: 'Invalid date value in rule',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_NUMBER_VALUE]: {
        code: 1109,
        message: 'Invalid number value in rule',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_BOOLEAN_VALUE]: {
        code: 1110,
        message: 'Invalid boolean value in rule. Must be true/false',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_INVALID_VALUE]: {
        code: 1111,
        message: 'Invalid value in rule',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACHIEVEMENT_MISSING_USER_ID]: {
        code: 1112,
        message: 'Missing user id for evaluation',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.FRAME_TITLE_REQUIRED]: {
        code: 1200,
        message: 'Frame title is required',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.FRAME_TITLE_TOO_SHORT]: {
        code: 1201,
        message: 'Frame title must be at least 2 characters long',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.FRAME_TITLE_TOO_LONG]: {
        code: 1202,
        message: 'Frame title must not exceed 100 characters',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.FRAME_NOT_FOUND]: {
        code: 1203,
        message: 'Frame not found',
        httpStatus: common_1.HttpStatus.NOT_FOUND,
    },
    [ErrorCode.FRAME_INVALID_ID]: {
        code: 1204,
        message: 'Invalid frame ID format',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.FRAME_UPLOAD_FAILED]: {
        code: 1205,
        message: 'Failed to upload frame icon',
        httpStatus: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
    },
    [ErrorCode.FRAME_INVALID_FILE_TYPE]: {
        code: 1206,
        message: 'Invalid file type. Only images are allowed',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.FRAME_FILE_TOO_LARGE]: {
        code: 1207,
        message: 'File size too large. Maximum size is 5MB',
        httpStatus: common_1.HttpStatus.BAD_REQUEST,
    },
};
//# sourceMappingURL=error-code.enum.js.map