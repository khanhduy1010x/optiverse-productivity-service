"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    constructor(data = null) {
        const responseObject = {
            code: 1000,
            message: 'success',
        };
        if (data !== null) {
            responseObject.data = data;
        }
        Object.assign(this, responseObject);
    }
}
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=api-response.js.map