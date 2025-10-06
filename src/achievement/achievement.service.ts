import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Achievement, Operator, Rule, RuleCategory, ValueType, LogicOperator } from './achievement.schema';
import { AchievementRepository } from './achievement.repository';
import { Task } from 'src/tasks/task.schema';
import { Friend } from 'src/friends/friend.schema';
import { Streak } from 'src/streaks/streak.schema';
import { UserAchievementRepository } from 'src/user-achievements/user-achievement.repository';

export interface EvaluationResult {
  achievementId: string;
  unlocked: boolean;
  details: { 
    ruleIndex: number; 
    count: number; 
    threshold: number; 
    passed: boolean;
    dateInfo?: {
      currentTime: string;
      conditionValue: string;
      calculatedRange?: {
        start: string;
        end: string;
      };
    };
  }[];
}

@Injectable()
export class AchievementService {
  constructor(
    private readonly achievementRepository: AchievementRepository,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(Friend.name) private readonly friendModel: Model<Friend>,
    @InjectModel(Streak.name) private readonly streakModel: Model<Streak>,
    private readonly userAchievementRepository: UserAchievementRepository,
  ) {}

  async getAllAchievements(): Promise<Achievement[]> {
    return this.achievementRepository.getAll();
  }

  async evaluateForUser(userId: string): Promise<{ unlocked: string[]; locked: string[]; results: EvaluationResult[]; newlyUnlocked: string[] }> {
    const achievements = await this.achievementRepository.getAll();
    const unlockedIds: string[] = [];
    const lockedIds: string[] = [];
    const newlyUnlockedIds: string[] = [];
    const results: EvaluationResult[] = [];

    for (const ach of achievements) {
      // Kiểm tra xem user đã có achievement này chưa
      const hasAchievement = await this.userAchievementRepository.checkUserHasAchievement(userId, ach._id.toString());
      if (hasAchievement) {
        // Nếu đã có achievement rồi thì chỉ thêm vào unlocked, KHÔNG thêm vào newlyUnlocked
        unlockedIds.push(ach._id.toString());
        // Tạo evaluation result với unlocked = true nhưng không cần tính toán chi tiết
        results.push({
          achievementId: ach._id.toString(),
          unlocked: true,
          details: [] // Empty details vì đã unlock rồi
        });
        continue;
      }

      // Chỉ evaluate những achievement chưa có
      const evalResult = await this.evaluateAchievement(userId, ach);
      results.push(evalResult);
      
      if (evalResult.unlocked) {
        unlockedIds.push(ach._id.toString());
        newlyUnlockedIds.push(ach._id.toString()); // Chỉ thêm vào newlyUnlocked khi mới unlock
        // Tạo user-achievement cho achievement mới unlock
        await this.userAchievementRepository.createUserAchievement(userId, ach._id.toString());
      } else {
        lockedIds.push(ach._id.toString());
      }
    }

    return { unlocked: unlockedIds, locked: lockedIds, results, newlyUnlocked: newlyUnlockedIds };
  }

  private async evaluateAchievement(userId: string, achie: Achievement): Promise<EvaluationResult> {
    const details: { 
      ruleIndex: number; 
      count: number; 
      threshold: number; 
      passed: boolean;
      dateInfo?: {
        currentTime: string;
        conditionValue: string;
        calculatedRange?: {
          start: string;
          end: string;
        };
      };
    }[] = [];
    const logicOperator = achie.logic_operator || LogicOperator.AND;

    let overallResult = logicOperator === LogicOperator.AND ? true : false;

    // Nếu có rule TASK với DATE (ví dụ updatedAt: 7D) và các rule TASK khác (ví dụ status: completed)
    // thì gộp lại thành một count: đếm số TASK thỏa tất cả các filter trong khoảng 7 ngày
    // bắt đầu từ ngày hoàn thành đầu tiên (anchor).
    const taskDateRuleIndex = (achie.rules || []).findIndex(
      (r) => r.category === RuleCategory.TASK && r.value_type === ValueType.DATE,
    );
    let taskCombinedCount: number | null = null;
    let taskCombinedDateInfo: any | null = null;
    if (taskDateRuleIndex !== -1) {
      const userObjectId = new Types.ObjectId(userId);
      // Gom các filter của rule TASK khác DATE (ví dụ status)
      let combinedFilter: any = { user_id: userObjectId };
      for (const r of achie.rules) {
        if (r.category === RuleCategory.TASK && r.value_type !== ValueType.DATE) {
          combinedFilter = { ...combinedFilter, ...this.buildFieldFilter(r, achie) };
        }
      }

      // Xác định trường ngày dùng làm mốc neo theo rule DATE
      const dateField = achie.rules[taskDateRuleIndex].field || 'updatedAt';

      // Lấy tất cả mốc thời gian (đã áp dụng filter non-date), sắp xếp theo thời gian theo trường DATE
      const tasks = await this.taskModel
        .find(combinedFilter)
        .sort({ [dateField]: 1 })
        .select({ [dateField]: 1 })
        .exec();

      const tokenValue = achie.rules[taskDateRuleIndex].value;
      
      // Sử dụng hàm getDateRange để parse khoảng thời gian
      const now = new Date();
      const dateRange = this.getDateRange(tokenValue, now);
      
      let bestCount = 0;
      let bestStart: Date | null = null;
      let bestEnd: Date | null = null;

      if (dateRange) {
        // Nếu có khoảng thời gian cụ thể (như "2025-10-20 to 2025-10-23"), sử dụng trực tiếp
        const dateFilter = { [dateField]: { $gte: dateRange.start, $lte: dateRange.end } };
        const cnt = await this.taskModel
          .countDocuments({ ...combinedFilter, ...dateFilter })
          .exec();
        bestCount = cnt;
        bestStart = dateRange.start;
        bestEnd = dateRange.end;
      } else {
        // Fallback: nếu không parse được, thử logic cũ với sliding window
        const days = parseInt(String(tokenValue).toUpperCase().replace('D', '')) || 7;

        for (const t of tasks) {
          const anchorDate = new Date((t as any)[dateField]);
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
        calculatedRange:
          bestStart && bestEnd
            ? { start: bestStart.toISOString(), end: bestEnd.toISOString() }
            : undefined,
      };
    }

    // FRIEND: gộp rule nếu có DATE cùng với các filter khác, dùng mốc neo theo trường DATE của rule
    const friendDateRuleIndex = (achie.rules || []).findIndex(
      (r) => r.category === RuleCategory.FRIEND && r.value_type === ValueType.DATE,
    );
    let friendCombinedCount: number | null = null;
    let friendCombinedDateInfo: any | null = null;
    if (friendDateRuleIndex !== -1) {
      const userObjectId = new Types.ObjectId(userId);
      // Base filter cho FRIEND: user là một trong hai phía
      let combinedFilter: any = { $or: [{ user_id: userObjectId }, { friend_id: userObjectId }] };
      for (const r of achie.rules) {
        if (r.category === RuleCategory.FRIEND && r.value_type !== ValueType.DATE) {
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
      
      // Sử dụng hàm getDateRange để parse khoảng thời gian
      const now = new Date();
      const dateRange = this.getDateRange(tokenValue, now);
      
      let bestCount = 0;
      let bestStart: Date | null = null;
      let bestEnd: Date | null = null;

      if (dateRange) {
        // Nếu có khoảng thời gian cụ thể (như "2025-10-20 to 2025-10-23"), sử dụng trực tiếp
        const dateFilter = { [dateField]: { $gte: dateRange.start, $lte: dateRange.end } };
        const cnt = await this.friendModel
          .countDocuments({ ...combinedFilter, ...dateFilter })
          .exec();
        bestCount = cnt;
        bestStart = dateRange.start;
        bestEnd = dateRange.end;
      } else {
        // Fallback: nếu không parse được, thử logic cũ với sliding window
        const days = parseInt(String(tokenValue).toUpperCase().replace('D', '')) || 7;
        
        for (const f of friends) {
          const anchorDate = new Date((f as any)[dateField]);
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
        calculatedRange:
          bestStart && bestEnd
            ? { start: bestStart.toISOString(), end: bestEnd.toISOString() }
            : undefined,
      };
    }

    // NOTE: gộp rule nếu có DATE cùng với các filter khác, dùng mốc neo theo trường DATE của rule
    // NOTE logic removed - no longer supported

    for (let i = 0; i < (achie.rules || []).length; i++) {
      const rule = achie.rules[i];
      const count =
        rule.category === RuleCategory.TASK && taskCombinedCount !== null
          ? taskCombinedCount
          : rule.category === RuleCategory.FRIEND && friendCombinedCount !== null
          ? friendCombinedCount
          : await this.countByRule(userId, rule, achie);
      
      let passed: boolean;
      let threshold: number;
      let dateInfo: any = undefined;
      
      // Lấy thông tin date nếu rule có value_type là DATE
      if (rule.value_type === ValueType.DATE) {
        // Nếu đã có gộp cho TASK thì hiển thị dateInfo theo khoảng từ mốc hoàn thành đầu tiên
        if (rule.category === RuleCategory.TASK && taskCombinedDateInfo) {
          dateInfo = taskCombinedDateInfo;
        } else if (rule.category === RuleCategory.FRIEND && friendCombinedDateInfo) {
          dateInfo = friendCombinedDateInfo;
        } else {
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
        console.log(
          `[DATE COMPARISON] Rule ${i}: field=${rule.field}, value=${rule.value}, operator=${rule.operator}, count=${count}, threshold=${rule.threshold}`,
        );
      }
      
      // Đối với DATE và BOOLEAN, nếu không có threshold thì chỉ cần count > 0
      if ((rule.value_type === ValueType.DATE || rule.value_type === ValueType.BOOLEAN) && rule.threshold === undefined) {
        threshold = 0;
        passed = count > 0;
        if (rule.value_type === ValueType.DATE) {
          console.log(`[DATE COMPARISON] Using default threshold=0, passed=${passed}`);
        }
      } else {
        threshold = rule.threshold || 0;
        passed = this.compare(count, threshold, rule.operator);
        if (rule.value_type === ValueType.DATE) {
          console.log(`[DATE COMPARISON] Using threshold=${threshold}, passed=${passed}`);
        }
      }
      
      details.push({ ruleIndex: i, count, threshold, passed, dateInfo });

      if (logicOperator === LogicOperator.AND) {
        overallResult = overallResult && passed;
        // Nếu AND và có rule fail thì có thể return sớm để tối ưu
        if (!passed) {
          return { achievementId: achie._id.toString(), unlocked: false, details };
        }
      } else {
        // LogicOperator.OR
        overallResult = overallResult || passed;
      }
    }

    return { achievementId: achie._id.toString(), unlocked: overallResult, details };
  }

  private async countByRule(userId: string, rule: Rule, achie?: Achievement): Promise<number> {
    const userObjectId = new Types.ObjectId(userId);
    let filter: any = {};

    if (rule.category === RuleCategory.TASK) {
      filter.user_id = userObjectId;
      filter = { ...filter, ...this.buildFieldFilter(rule, achie) };
      return this.taskModel.countDocuments(filter).exec();
    }

    if (rule.category === RuleCategory.FRIEND) {
      const base = { $or: [{ user_id: userObjectId }, { friend_id: userObjectId }] };
      filter = { ...base, ...this.buildFieldFilter(rule, achie) };
      return this.friendModel.countDocuments(filter).exec();
    }

    if (rule.category === RuleCategory.STREAK) {
      // For STREAK, we get the field value directly instead of counting documents
      const streakDoc = await this.streakModel.findOne({ user_id: userObjectId }).exec();
      if (!streakDoc) return 0;
      
      const fieldValue = (streakDoc as any)[rule.field];
      return typeof fieldValue === 'number' ? fieldValue : 0;
    }

    return 0;
  }

  private buildFieldFilter(rule: Rule, achie?: Achievement): any {
    const field = rule.field;
    const valueType = rule.value_type;
    const rawValue = rule.value;

    if (valueType === ValueType.DATE) {
      const token = typeof rawValue === 'string' ? rawValue.trim().toUpperCase() : '';
      const stringVal = typeof rawValue === 'string' ? rawValue.trim() : '';
      const now = new Date();

      console.log(`[DATE FILTER] Current time: ${now.toISOString()}`);
      console.log(`[DATE FILTER] Rule condition value: ${rawValue}`);

      const windowForDays = (n: number) => {
        // Forward window: from start of today to end of day + (n-1)
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + (n - 1));
        end.setHours(23, 59, 59, 999);
        return { start, end };
      };

      // Chỉ hỗ trợ 3 token: 1D / 7D / 30D
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

      // Hỗ trợ chuỗi khoảng ngày: "Threshold *
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

      // Fallback nếu không parse được
      return {};
    }

    if (valueType === ValueType.STRING || valueType === ValueType.ENUM) {
      const v = String(rawValue ?? '').trim();
      if (rule.operator === Operator.NE) {
        return { [field]: { $ne: v } };
      }
      // Mặc định EQ
      return { [field]: v };
    }

    if (valueType === ValueType.NUMBER) {
      const num = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));
      if (Number.isNaN(num)) return {};
      switch (rule.operator) {
        case Operator.GT:
          return { [field]: { $gt: num } };
        case Operator.GTE:
          return { [field]: { $gte: num } };
        case Operator.LT:
          return { [field]: { $lt: num } };
        case Operator.LTE:
          return { [field]: { $lte: num } };
        case Operator.NE:
          return { [field]: { $ne: num } };
        case Operator.EQ:
        default:
          return { [field]: num };
      }
    }

    if (valueType === ValueType.BOOLEAN) {
      const vStr = String(rawValue ?? '').trim().toLowerCase();
      const b = vStr === 'true' || vStr === '1';
      if (rule.operator === Operator.NE) {
        return { [field]: { $ne: b } };
      }
      // Mặc định EQ
      return { [field]: b };
    }

    // Mặc định không áp dụng filter
    return {};
  }

  private getDateRange(value: any, now: Date): { start: Date; end: Date } | null {
    const token = typeof value === 'string' ? value.trim().toUpperCase() : '';
    const stringVal = typeof value === 'string' ? value.trim() : '';

    const windowForDays = (n: number) => {
      // Forward window: from start of today to end of day + (n-1)
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + (n - 1));
      end.setHours(23, 59, 59, 999);
      return { start, end };
    };

    // Chỉ hỗ trợ 3 token: 1D / 7D / 30D
    if (token === '1D') {
      return windowForDays(1);
    }
    if (token === '7D') {
      return windowForDays(7);
    }
    if (token === '30D') {
      return windowForDays(30);
    }

    // Hỗ trợ chuỗi khoảng ngày: "YYYY-MM-DD to YYYY-MM-DD"
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

      // Hỗ trợ ngày đơn lẻ: "YYYY-MM-DD"
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

      // Token TODAY (nếu có)
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

  private compare(a: number, b: number, operator: Operator): boolean {
    switch (operator) {
      case Operator.GT:
        return a > b;
      case Operator.GTE:
        return a >= b;
      case Operator.LT:
        return a < b;
      case Operator.LTE:
        return a <= b;
      case Operator.NE:
        return a !== b;
      case Operator.EQ:
      default:
        return a === b;
    }
  }
}