"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareResponse = exports.SharedUserResponse = exports.UserInfoDto = void 0;
class UserInfoDto {
}
exports.UserInfoDto = UserInfoDto;
class SharedUserResponse {
    constructor(sharedUser) {
        this.user_id = sharedUser.user_id.toString();
        this.permission = sharedUser.permission;
        this.shared_at = sharedUser.shared_at;
    }
}
exports.SharedUserResponse = SharedUserResponse;
class ShareResponse {
    constructor(share) {
        this.id = share._id.toString();
        this.owner_id = share.owner_id.toString();
        this.resource_type = share.resource_type;
        this.resource_id = share.resource_id.toString();
        this.shared_with = share.shared_with.map((user) => new SharedUserResponse(user));
        this.createdAt = share['createdAt'];
        this.updatedAt = share['updatedAt'];
    }
}
exports.ShareResponse = ShareResponse;
//# sourceMappingURL=ShareResponse.dto.js.map