"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAchievementResponse = void 0;
class UserAchievementResponse {
    constructor(userAchievement) {
        this.id = userAchievement._id.toString();
        this.user_id = userAchievement.user_id.toString();
        this.achievement = {
            id: userAchievement.achievement_id,
            title: 'Achievement',
            description: '',
            icon_url: '',
        };
        this.unlocked_at = userAchievement.unlocked_at;
    }
}
exports.UserAchievementResponse = UserAchievementResponse;
//# sourceMappingURL=UserAchievementResponse.dto.js.map