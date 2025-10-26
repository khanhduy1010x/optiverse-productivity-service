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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const achievement_schema_1 = require("./achievement.schema");
const achievement_repository_1 = require("./achievement.repository");
const task_schema_1 = require("../tasks/task.schema");
const friend_schema_1 = require("../friends/friend.schema");
const streak_schema_1 = require("../streaks/streak.schema");
const user_achievement_repository_1 = require("../user-achievements/user-achievement.repository");
let AchievementService = class AchievementService {
    constructor(achievementRepository, taskModel, friendModel, streakModel, userAchievementRepository) {
        this.achievementRepository = achievementRepository;
        this.taskModel = taskModel;
        this.friendModel = friendModel;
        this.streakModel = streakModel;
        this.userAchievementRepository = userAchievementRepository;
    }
    async getAllAchievements() {
        return this.achievementRepository.getAll();
    }
    async evaluateForUser(userId) {
        const achievements = await this.achievementRepository.getAll();
        const unlockedIds = [];
        const lockedIds = [];
        const newlyUnlockedIds = [];
        const results = [];
        for (const ach of achievements) {
            const hasAchievement = await this.userAchievementRepository.checkUserHasAchievement(userId, ach._id.toString());
            if (hasAchievement) {
                unlockedIds.push(ach._id.toString());
                results.push({
                    achievementId: ach._id.toString(),
                    unlocked: true,
                    details: []
                });
                continue;
            }
            const evalResult = await this.evaluateAchievement(userId, ach);
            results.push(evalResult);
            if (evalResult.unlocked) {
                unlockedIds.push(ach._id.toString());
                newlyUnlockedIds.push(ach._id.toString());
                await this.userAchievementRepository.createUserAchievement(userId, ach._id.toString());
            }
            else {
                lockedIds.push(ach._id.toString());
            }
        }
        return { unlocked: unlockedIds, locked: lockedIds, results, newlyUnlocked: newlyUnlockedIds };
    }
    async evaluateAchievement(userId, achie) {
        const details = [];
        const logicOperator = achie.logic_operator || achievement_schema_1.LogicOperator.AND;
        let overallResult = logicOperator === achievement_schema_1.LogicOperator.AND ? true : false;
        const taskDateRuleIndex = (achie.rules || []).findIndex((r) => r.category === achievement_schema_1.RuleCategory.TASK && r.value_type === achievement_schema_1.ValueType.DATE);
        let taskCombinedCount = null;
        let taskCombinedDateInfo = null;
        if (taskDateRuleIndex !== -1) {
            const userObjectId = new mongoose_2.Types.ObjectId(userId);
            let combinedFilter = { user_id: userObjectId };
            for (const r of achie.rules) {
                if (r.category === achievement_schema_1.RuleCategory.TASK && r.value_type !== achievement_schema_1.ValueType.DATE) {
                    combinedFilter = { ...combinedFilter, ...this.buildFieldFilter(r, achie) };
                }
            }
            const dateField = achie.rules[taskDateRuleIndex].field || 'updatedAt';
            const tasks = await this.taskModel
                .find(combinedFilter)
                .sort({ [dateField]: 1 })
                .select({ [dateField]: 1 })
                .exec();
            const tokenValue = achie.rules[taskDateRuleIndex].value;
            const now = new Date();
            const dateRange = this.getDateRange(tokenValue, now);
            let bestCount = 0;
            let bestStart = null;
            let bestEnd = null;
            if (dateRange) {
                const dateFilter = { [dateField]: { $gte: dateRange.start, $lte: dateRange.end } };
                const cnt = await this.taskModel
                    .countDocuments({ ...combinedFilter, ...dateFilter })
                    .exec();
                bestCount = cnt;
                bestStart = dateRange.start;
                bestEnd = dateRange.end;
            }
            else {
                const days = parseInt(String(tokenValue).toUpperCase().replace('D', '')) || 7;
                for (const t of tasks) {
                    const anchorDate = new Date(t[dateField]);
                    const start = new Date(anchorDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(start);
                    end.setDate(end.getDate() + (days - 1));
                    end.setHours(23, 59, 59, 999);
                    const dateFilter = { [dateField]: { $gte: start, $lte: end } };
                    const cnt = await this.taskModel
                        .countDocuments({ ...combinedFilter, ...dateFilter })
                        .exec();
                    if (cnt > bestCount) {
                        bestCount = cnt;
                        bestStart = start;
                        bestEnd = end;
                    }
                }
            }
            taskCombinedCount = bestCount;
            taskCombinedDateInfo = {
                currentTime: new Date().toISOString(),
                conditionValue: tokenValue,
                calculatedRange: bestStart && bestEnd
                    ? { start: bestStart.toISOString(), end: bestEnd.toISOString() }
                    : undefined,
            };
        }
        const friendDateRuleIndex = (achie.rules || []).findIndex((r) => r.category === achievement_schema_1.RuleCategory.FRIEND && r.value_type === achievement_schema_1.ValueType.DATE);
        let friendCombinedCount = null;
        let friendCombinedDateInfo = null;
        if (friendDateRuleIndex !== -1) {
            const userObjectId = new mongoose_2.Types.ObjectId(userId);
            let combinedFilter = { $or: [{ user_id: userObjectId }, { friend_id: userObjectId }] };
            for (const r of achie.rules) {
                if (r.category === achievement_schema_1.RuleCategory.FRIEND && r.value_type !== achievement_schema_1.ValueType.DATE) {
                    combinedFilter = { ...combinedFilter, ...this.buildFieldFilter(r, achie) };
                }
            }
            const dateField = achie.rules[friendDateRuleIndex].field || 'updatedAt';
            const friends = await this.friendModel
                .find(combinedFilter)
                .sort({ [dateField]: 1 })
                .select({ [dateField]: 1 })
                .exec();
            const tokenValue = achie.rules[friendDateRuleIndex].value;
            const now = new Date();
            const dateRange = this.getDateRange(tokenValue, now);
            let bestCount = 0;
            let bestStart = null;
            let bestEnd = null;
            if (dateRange) {
                const dateFilter = { [dateField]: { $gte: dateRange.start, $lte: dateRange.end } };
                const cnt = await this.friendModel
                    .countDocuments({ ...combinedFilter, ...dateFilter })
                    .exec();
                bestCount = cnt;
                bestStart = dateRange.start;
                bestEnd = dateRange.end;
            }
            else {
                const days = parseInt(String(tokenValue).toUpperCase().replace('D', '')) || 7;
                for (const f of friends) {
                    const anchorDate = new Date(f[dateField]);
                    const start = new Date(anchorDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(start);
                    end.setDate(end.getDate() + (days - 1));
                    end.setHours(23, 59, 59, 999);
                    const dateFilter = { [dateField]: { $gte: start, $lte: end } };
                    const cnt = await this.friendModel
                        .countDocuments({ ...combinedFilter, ...dateFilter })
                        .exec();
                    if (cnt > bestCount) {
                        bestCount = cnt;
                        bestStart = start;
                        bestEnd = end;
                    }
                }
            }
            friendCombinedCount = bestCount;
            friendCombinedDateInfo = {
                currentTime: new Date().toISOString(),
                conditionValue: tokenValue,
                calculatedRange: bestStart && bestEnd
                    ? { start: bestStart.toISOString(), end: bestEnd.toISOString() }
                    : undefined,
            };
        }
        for (let i = 0; i < (achie.rules || []).length; i++) {
            const rule = achie.rules[i];
            const count = rule.category === achievement_schema_1.RuleCategory.TASK && taskCombinedCount !== null
                ? taskCombinedCount
                : rule.category === achievement_schema_1.RuleCategory.FRIEND && friendCombinedCount !== null
                    ? friendCombinedCount
                    : await this.countByRule(userId, rule, achie);
            let passed;
            let threshold;
            let dateInfo = undefined;
            if (rule.value_type === achievement_schema_1.ValueType.DATE) {
                if (rule.category === achievement_schema_1.RuleCategory.TASK && taskCombinedDateInfo) {
                    dateInfo = taskCombinedDateInfo;
                }
                else if (rule.category === achievement_schema_1.RuleCategory.FRIEND && friendCombinedDateInfo) {
                    dateInfo = friendCombinedDateInfo;
                }
                else {
                    const now = new Date();
                    dateInfo = {
                        currentTime: now.toISOString(),
                        conditionValue: rule.value,
                    };
                    const calculatedRange = this.getDateRange(rule.value, now);
                    if (calculatedRange) {
                        dateInfo.calculatedRange = {
                            start: calculatedRange.start.toISOString(),
                            end: calculatedRange.end.toISOString(),
                        };
                    }
                }
                console.log(`[DATE COMPARISON] Rule ${i}: field=${rule.field}, value=${rule.value}, operator=${rule.operator}, count=${count}, threshold=${rule.threshold}`);
            }
            if ((rule.value_type === achievement_schema_1.ValueType.DATE || rule.value_type === achievement_schema_1.ValueType.BOOLEAN) && rule.threshold === undefined) {
                threshold = 0;
                passed = count > 0;
                if (rule.value_type === achievement_schema_1.ValueType.DATE) {
                    console.log(`[DATE COMPARISON] Using default threshold=0, passed=${passed}`);
                }
            }
            else {
                threshold = rule.threshold || 0;
                passed = this.compare(count, threshold, rule.operator);
                if (rule.value_type === achievement_schema_1.ValueType.DATE) {
                    console.log(`[DATE COMPARISON] Using threshold=${threshold}, passed=${passed}`);
                }
            }
            details.push({ ruleIndex: i, count, threshold, passed, dateInfo });
            if (logicOperator === achievement_schema_1.LogicOperator.AND) {
                overallResult = overallResult && passed;
                if (!passed) {
                    return { achievementId: achie._id.toString(), unlocked: false, details };
                }
            }
            else {
                overallResult = overallResult || passed;
            }
        }
        return { achievementId: achie._id.toString(), unlocked: overallResult, details };
    }
    async countByRule(userId, rule, achie) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        let filter = {};
        if (rule.category === achievement_schema_1.RuleCategory.TASK) {
            filter.user_id = userObjectId;
            filter = { ...filter, ...this.buildFieldFilter(rule, achie) };
            return this.taskModel.countDocuments(filter).exec();
        }
        if (rule.category === achievement_schema_1.RuleCategory.FRIEND) {
            const base = { $or: [{ user_id: userObjectId }, { friend_id: userObjectId }] };
            filter = { ...base, ...this.buildFieldFilter(rule, achie) };
            return this.friendModel.countDocuments(filter).exec();
        }
        if (rule.category === achievement_schema_1.RuleCategory.STREAK) {
            const streakDoc = await this.streakModel.findOne({ user_id: userObjectId }).exec();
            if (!streakDoc)
                return 0;
            const fieldValue = streakDoc[rule.field];
            return typeof fieldValue === 'number' ? fieldValue : 0;
        }
        return 0;
    }
    buildFieldFilter(rule, achie) {
        const field = rule.field;
        const valueType = rule.value_type;
        const rawValue = rule.value;
        if (valueType === achievement_schema_1.ValueType.DATE) {
            const token = typeof rawValue === 'string' ? rawValue.trim().toUpperCase() : '';
            const stringVal = typeof rawValue === 'string' ? rawValue.trim() : '';
            const now = new Date();
            console.log(`[DATE FILTER] Current time: ${now.toISOString()}`);
            console.log(`[DATE FILTER] Rule condition value: ${rawValue}`);
            const windowForDays = (n) => {
                const start = new Date(now);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setDate(end.getDate() + (n - 1));
                end.setHours(23, 59, 59, 999);
                return { start, end };
            };
            if (token === '1D') {
                const { start, end } = windowForDays(1);
                console.log(`[DATE FILTER] 1D range: ${start.toISOString()} to ${end.toISOString()}`);
                return { [field]: { $gte: start, $lte: end } };
            }
            if (token === '7D') {
                const { start, end } = windowForDays(7);
                console.log(`[DATE FILTER] 7D range: ${start.toISOString()} to ${end.toISOString()}`);
                return { [field]: { $gte: start, $lte: end } };
            }
            if (token === '30D') {
                const { start, end } = windowForDays(30);
                console.log(`[DATE FILTER] 30D range: ${start.toISOString()} to ${end.toISOString()}`);
                return { [field]: { $gte: start, $lte: end } };
            }
            if (stringVal) {
                const mTo = stringVal.match(/^(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})$/i);
                if (mTo) {
                    const rangeStart = new Date(mTo[1]);
                    const rangeEnd = new Date(mTo[2]);
                    if (!isNaN(rangeStart.getTime()) && !isNaN(rangeEnd.getTime())) {
                        const start = new Date(rangeStart);
                        const end = new Date(rangeEnd);
                        if (end < start) {
                            console.log(`[DATE FILTER] Invalid range: end date ${end.toISOString()} is before start date ${start.toISOString()}`);
                            return {};
                        }
                        start.setHours(0, 0, 0, 0);
                        end.setHours(23, 59, 59, 999);
                        console.log(`[DATE FILTER] Date range: ${start.toISOString()} to ${end.toISOString()}`);
                        return { [field]: { $gte: start, $lte: end } };
                    }
                }
            }
            return {};
        }
        if (valueType === achievement_schema_1.ValueType.STRING || valueType === achievement_schema_1.ValueType.ENUM) {
            const v = String(rawValue ?? '').trim();
            if (rule.operator === achievement_schema_1.Operator.NE) {
                return { [field]: { $ne: v } };
            }
            return { [field]: v };
        }
        if (valueType === achievement_schema_1.ValueType.NUMBER) {
            const num = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));
            if (Number.isNaN(num))
                return {};
            switch (rule.operator) {
                case achievement_schema_1.Operator.GT:
                    return { [field]: { $gt: num } };
                case achievement_schema_1.Operator.GTE:
                    return { [field]: { $gte: num } };
                case achievement_schema_1.Operator.LT:
                    return { [field]: { $lt: num } };
                case achievement_schema_1.Operator.LTE:
                    return { [field]: { $lte: num } };
                case achievement_schema_1.Operator.NE:
                    return { [field]: { $ne: num } };
                case achievement_schema_1.Operator.EQ:
                default:
                    return { [field]: num };
            }
        }
        if (valueType === achievement_schema_1.ValueType.BOOLEAN) {
            const vStr = String(rawValue ?? '').trim().toLowerCase();
            const b = vStr === 'true' || vStr === '1';
            if (rule.operator === achievement_schema_1.Operator.NE) {
                return { [field]: { $ne: b } };
            }
            return { [field]: b };
        }
        return {};
    }
    getDateRange(value, now) {
        const token = typeof value === 'string' ? value.trim().toUpperCase() : '';
        const stringVal = typeof value === 'string' ? value.trim() : '';
        const windowForDays = (n) => {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + (n - 1));
            end.setHours(23, 59, 59, 999);
            return { start, end };
        };
        if (token === '1D') {
            return windowForDays(1);
        }
        if (token === '7D') {
            return windowForDays(7);
        }
        if (token === '30D') {
            return windowForDays(30);
        }
        if (stringVal) {
            const mTo = stringVal.match(/^(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})$/i);
            if (mTo) {
                const rangeStart = new Date(mTo[1]);
                const rangeEnd = new Date(mTo[2]);
                if (!isNaN(rangeStart.getTime()) && !isNaN(rangeEnd.getTime())) {
                    const start = new Date(rangeStart);
                    const end = new Date(rangeEnd);
                    if (end >= start) {
                        start.setHours(0, 0, 0, 0);
                        end.setHours(23, 59, 59, 999);
                        return { start, end };
                    }
                }
            }
            const mSingle = stringVal.match(/^(\d{4}-\d{2}-\d{2})$/);
            if (mSingle) {
                const d = new Date(mSingle[1]);
                if (!isNaN(d.getTime())) {
                    const start = new Date(d);
                    const end = new Date(d);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return { start, end };
                }
            }
            if (token === 'TODAY') {
                const start = new Date(now);
                const end = new Date(now);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return { start, end };
            }
        }
        return null;
    }
    compare(a, b, operator) {
        switch (operator) {
            case achievement_schema_1.Operator.GT:
                return a > b;
            case achievement_schema_1.Operator.GTE:
                return a >= b;
            case achievement_schema_1.Operator.LT:
                return a < b;
            case achievement_schema_1.Operator.LTE:
                return a <= b;
            case achievement_schema_1.Operator.NE:
                return a !== b;
            case achievement_schema_1.Operator.EQ:
            default:
                return a === b;
        }
    }
};
exports.AchievementService = AchievementService;
exports.AchievementService = AchievementService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __param(2, (0, mongoose_1.InjectModel)(friend_schema_1.Friend.name)),
    __param(3, (0, mongoose_1.InjectModel)(streak_schema_1.Streak.name)),
    __metadata("design:paramtypes", [achievement_repository_1.AchievementRepository,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        user_achievement_repository_1.UserAchievementRepository])
], AchievementService);
//# sourceMappingURL=achievement.service.js.map