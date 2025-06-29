"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const user_dto_1 = require("../user-dto/user.dto");
let AuthMiddleware = class AuthMiddleware {
    use(req, res, next) {
        const userInfoBase64 = req.headers['x-user-info'];
        let user = null;
        if (userInfoBase64) {
            try {
                const userInfoJson = Buffer.from(userInfoBase64, 'base64').toString();
                console.log('Decoded userInfo:', userInfoJson);
                const parsedUser = JSON.parse(userInfoJson);
                user = new user_dto_1.UserDto();
                user.userId = parsedUser._id;
                user.email = parsedUser.email;
                user.fullName = parsedUser.full_name;
                user.avatar_url = parsedUser.avatar_url || undefined;
            }
            catch (error) {
                console.error('Error parsing X-User-Info:', error);
            }
        }
        else {
            console.warn('No X-User-Info header found');
        }
        const customReq = req;
        customReq.userInfo = user;
        next();
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)()
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map