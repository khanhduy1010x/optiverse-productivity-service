import { HttpStatus } from '@nestjs/common';
export declare enum ErrorCode {
    INVALID_CODE = 0,
    UNCATEGORIZED_CODE = 1,
    INVALID_USERNAME = 2,
    NULL_USERNAME = 3,
    NULL_PASSWORD = 4,
    INVALID_PASSWORD = 5,
    UNAUTHENTICATED = 6,
    UNAUTHORIZED = 7,
    NOT_FOUND = 8,
    SERVER_ERROR = 9,
    INVALID_DECKNAME = 10,
    MISSING_SECRET_KEY = 11,
    EMAIL_EXISTS = 12,
    VERIFY_TIME_OUT = 13,
    INVALID_OTP = 14,
    WATTING_TIME_OTP = 15,
    ACCOUNT_NOT_VERIFIED = 16,
    EMAIL_EXISTS_NOT_VERIFY = 17,
    CURRENT_PASSWORD_NOT_MATCH = 18,
    INVALID_TOKEN_GOOGLE = 19,
    ACCOUNT_IS_LOGOUT = 20,
    MISSING_ACCESS_TOKEN = 21,
    RESOURCE_NOT_FOUND = 22,
    PERMISSION_DENIED = 23,
    INVALID_RESOURCE_TYPE = 24,
    SHARE_NOT_FOUND = 25,
    UPDATE_SHARE_FAILED = 26
}
export declare const ErrorDetails: {
    0: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    1: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    2: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    3: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    4: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    5: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    6: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    7: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    8: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    9: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    10: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    11: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    12: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    13: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    14: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    15: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    16: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    17: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    18: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    19: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    20: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    21: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    22: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    23: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    24: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    25: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
    26: {
        code: number;
        message: string;
        httpStatus: HttpStatus;
    };
};
