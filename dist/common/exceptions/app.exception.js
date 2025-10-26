"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppException = void 0;
const common_1 = require("@nestjs/common");
const error_code_enum_1 = require("./error-code.enum");
class AppException extends common_1.HttpException {
    constructor(errorCode) {
        const { message, httpStatus, code } = error_code_enum_1.ErrorDetails[errorCode] || error_code_enum_1.ErrorDetails[error_code_enum_1.ErrorCode.UNCATEGORIZED_CODE];
        super({ code, message }, httpStatus);
        this.errorCode = code;
    }
}
exports.AppException = AppException;
//# sourceMappingURL=app.exception.js.map