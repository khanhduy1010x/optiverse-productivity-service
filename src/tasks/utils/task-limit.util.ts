import { MembershipLevel } from '../enums/membership-level.enum';

/**
 * Mapping task limit theo membership level
 * Giới hạn số lượng task có thể tạo trong 1 ngày (từ 00:00 đến 23:59)
 */
const TASK_LIMIT_BY_MEMBERSHIP: Record<MembershipLevel, number> = {
  [MembershipLevel.BASIC]: 20,
  [MembershipLevel.PLUS]: 50,
  [MembershipLevel.BUSINESS]: Infinity, // Unlimited
};

/**
 * Task limit cho FREE membership (khi hasActiveMembership: false)
 */
const FREE_TASK_LIMIT = 10;

/**
 * Lấy giới hạn task theo membership level
 * 
 * Logic:
 * - Nếu hasActiveMembership: false → FREE (10 tasks)
 * - Nếu hasActiveMembership: true:
 *   - level 0 → BASIC (20 tasks)
 *   - level 1 → PLUS (50 tasks)
 *   - level 2 → BUSINESS (Unlimited)
 *   - level khác → FREE (10 tasks) - invalid level được coi là FREE
 * 
 * @param membershipLevel - Level membership của user (0=BASIC, 1=PLUS, 2=BUSINESS)
 * @param hasActiveMembership - Nếu false thì user là FREE membership, bất kể level
 * @returns Số lượng task có thể tạo trong 1 ngày
 */
export function getTaskLimitByMembershipLevel(membershipLevel: number, hasActiveMembership: boolean = true): number {
  // Prioritize hasActiveMembership: nếu false thì luôn return FREE, không xét level
  if (!hasActiveMembership) {
    console.log('[getTaskLimitByMembershipLevel] hasActiveMembership: false → FREE (10 tasks)');
    return FREE_TASK_LIMIT;
  }

  // Khi hasActiveMembership: true, xét level để quyết định tier
  // Chỉ chấp nhận level 0, 1, 2 - nếu level khác thì coi là FREE
  if (!Number.isInteger(membershipLevel) || membershipLevel < 0 || membershipLevel > 2) {
    console.log(`[getTaskLimitByMembershipLevel] hasActiveMembership: true nhưng level ${membershipLevel} không hợp lệ → FREE (10 tasks)`);
    return FREE_TASK_LIMIT;
  }

  const limit = TASK_LIMIT_BY_MEMBERSHIP[membershipLevel as MembershipLevel];
  console.log(`[getTaskLimitByMembershipLevel] hasActiveMembership: true + level ${membershipLevel} → ${membershipLevel === 0 ? 'BASIC (20 tasks)' : membershipLevel === 1 ? 'PLUS (50 tasks)' : 'BUSINESS (Unlimited)'}`);
  
  return limit;
}

/**
 * Check xem user có thể tạo task không dựa trên giới hạn ngày
 * 
 * Hoạt động cho tất cả membership levels:
 * - FREE (hasActiveMembership: false): limit 10 tasks/ngày
 * - BASIC (level 0, hasActiveMembership: true): limit 20 tasks/ngày
 * - PLUS (level 1, hasActiveMembership: true): limit 50 tasks/ngày
 * - BUSINESS (level 2, hasActiveMembership: true): limit Infinity → luôn return true
 * - Invalid level + hasActiveMembership: true → coi là FREE (limit 10)
 * 
 * @param tasksCreatedToday - Số task đã tạo hôm nay
 * @param membershipLevel - Level membership (0=BASIC, 1=PLUS, 2=BUSINESS)
 * @param hasActiveMembership - Nếu false thì user là FREE membership, bất kể level
 * @returns true nếu user có thể tạo task, false nếu đã đạt giới hạn
 */
export function canCreateTask(tasksCreatedToday: number, membershipLevel: number, hasActiveMembership: boolean = true): boolean {
  const limit = getTaskLimitByMembershipLevel(membershipLevel, hasActiveMembership);
  
  // Nếu limit là Infinity (BUSINESS), luôn cho phép
  if (!isFinite(limit)) {
    console.log('[canCreateTask] Limit is Infinity (BUSINESS) → allowing creation');
    return true;
  }
  
  const canCreate = tasksCreatedToday < limit;
  console.log(`[canCreateTask] CHECK: tasksCreatedToday=${tasksCreatedToday} < limit=${limit} = ${canCreate} (${canCreate ? '✅ CAN CREATE' : '❌ CANNOT CREATE'})`);
  
  return canCreate;
}

/**
 * Lấy tin nhắn lỗi khi user vượt giới hạn
 * @param membershipLevel - Level membership (0=BASIC, 1=PLUS, 2=BUSINESS)
 * @param hasActiveMembership - Nếu false thì user là FREE membership
 * @returns Tin nhắn lỗi
 */
export function getTaskLimitErrorMessage(membershipLevel: number, hasActiveMembership: boolean = true): string {
  const limit = getTaskLimitByMembershipLevel(membershipLevel, hasActiveMembership);

  if (!isFinite(limit)) {
    return 'Unlimited tasks allowed'; // Không nên gặp tình huống này
  }

  const membershipNames: Record<number, string> = {
    0: 'BASIC',
    1: 'PLUS',
    2: 'BUSINESS',
  };

  // Add FREE membership if not active
  let membershipName = membershipNames[membershipLevel] || 'Unknown';
  if (!hasActiveMembership) {
    membershipName = 'FREE';
  }

  return `You have reached the daily task limit of ${limit} tasks for ${membershipName} membership. Please upgrade your membership to create more tasks.`;
}

/**
 * Mapping membership level description
 */
export const MEMBERSHIP_LEVEL_DESCRIPTIONS: Record<number, { name: string; dailyLimit: number | string }> = {
  0: { name: 'BASIC', dailyLimit: 20 },
  1: { name: 'PLUS', dailyLimit: 50 },
  2: { name: 'BUSINESS', dailyLimit: 'Unlimited' },
};

/**
 * Description cho FREE membership
 */
export const FREE_MEMBERSHIP_DESCRIPTION = { name: 'FREE', dailyLimit: 10 };

/**
 * Lấy upgrade suggestion dựa trên membership level hiện tại
 * @param currentMembershipLevel - Level membership hiện tại (0=BASIC, 1=PLUS, 2=BUSINESS)
 * @param hasActiveMembership - Nếu false thì user là FREE membership
 * @returns Gợi ý upgrade với thông tin membership level tiếp theo
 */
export function getUpgradeSuggestion(currentMembershipLevel: number, hasActiveMembership: boolean = true): {
  currentLevel: string;
  currentLimit: number;
  suggestedLevel: string;
  suggestedLimit: number;
  limitIncrease: number;
} | null {
  const membershipLevelMap = {
    'FREE': {
      name: 'FREE',
      limit: 10,
      nextLevel: 'BASIC',
    },
    'BASIC': {
      name: 'BASIC',
      limit: 20,
      nextLevel: 'PLUS',
    },
    'PLUS': {
      name: 'PLUS',
      limit: 50,
      nextLevel: 'BUSINESS',
    },
    'BUSINESS': {
      name: 'BUSINESS',
      limit: Infinity,
      nextLevel: null,
    },
  };

  // Determine current membership name
  let currentMembershipName: string;
  if (!hasActiveMembership) {
    currentMembershipName = 'FREE';
  } else {
    const levelMap = { 0: 'BASIC', 1: 'PLUS', 2: 'BUSINESS' };
    currentMembershipName = levelMap[currentMembershipLevel] || 'FREE';
  }

  const currentInfo = membershipLevelMap[currentMembershipName];

  if (!currentInfo || !currentInfo.nextLevel) {
    return null; // BUSINESS không có upgrade nữa
  }

  const nextInfo = membershipLevelMap[currentInfo.nextLevel];

  return {
    currentLevel: currentInfo.name,
    currentLimit: currentInfo.limit,
    suggestedLevel: nextInfo.name,
    suggestedLimit: nextInfo.limit === Infinity ? 999999 : nextInfo.limit, // Use large number instead of Infinity for JSON
    limitIncrease: nextInfo.limit === Infinity ? Infinity : nextInfo.limit - currentInfo.limit,
  };
}

/**
 * Lấy detailed error response khi user vượt giới hạn
 * Bao gồm thông tin upgrade suggestion
 */
export function getDetailedLimitExceededResponse(membershipLevel: number, tasksCreatedToday: number = 0, hasActiveMembership: boolean = true): {
  code: number;
  message: string;
  error: 'TASK_LIMIT_EXCEEDED';
  details: {
    currentLevel: string;
    currentLimit: number;
    tasksRemaining: number;
    tasksCreatedToday: number;
    resetTime: string;
  };
  upgrade: {
    suggestedLevel: string;
    suggestedLimit: number | string;
    limitIncrease: number | string;
    benefits: string[];
  };
} {
  const limit = getTaskLimitByMembershipLevel(membershipLevel, hasActiveMembership);
  const upgradeSuggestion = getUpgradeSuggestion(membershipLevel, hasActiveMembership);

  const membershipNames: Record<number, string> = {
    0: 'BASIC',
    1: 'PLUS',
    2: 'BUSINESS',
  };

  // Map benefits based on upgrade
  const benefitsMap: Record<string, string[]> = {
    'FREE->BASIC': [
      'Increase daily task limit from 10 to 20 tasks',
      'Priority support',
      'Better organization features',
    ],
    'BASIC->PLUS': [
      'Increase daily task limit from 20 to 50 tasks',
      'Collaboration features',
      'Advanced analytics',
    ],
    'PLUS->BUSINESS': [
      'Unlimited daily tasks',
      'Team workspace',
      'Enterprise support',
      'API access',
    ],
  };

  let membershipName = membershipNames[membershipLevel] || 'Unknown';
  if (!hasActiveMembership) {
    membershipName = 'FREE';
  }

  const upgradeKey = upgradeSuggestion ? `${membershipName}->${upgradeSuggestion.suggestedLevel}` : '';
  const benefits = benefitsMap[upgradeKey] || [];

  return {
    code: 400,
    message: `You have reached the daily task limit of ${limit} tasks for ${membershipName} membership. Please upgrade your membership to create more tasks.`,
    error: 'TASK_LIMIT_EXCEEDED',
    details: {
      currentLevel: membershipName,
      currentLimit: limit,
      tasksRemaining: Math.max(0, limit - tasksCreatedToday),
      tasksCreatedToday: tasksCreatedToday,
      resetTime: getNextResetTime(),
    },
    upgrade: upgradeSuggestion
      ? {
          suggestedLevel: upgradeSuggestion.suggestedLevel,
          suggestedLimit:
            upgradeSuggestion.suggestedLimit === 999999 ? 'Unlimited' : upgradeSuggestion.suggestedLimit,
          limitIncrease:
            upgradeSuggestion.limitIncrease === Infinity
              ? 'Unlimited'
              : `+${upgradeSuggestion.limitIncrease}`,
          benefits,
        }
      : {
          suggestedLevel: membershipName,
          suggestedLimit: 'N/A',
          limitIncrease: 'N/A',
          benefits: ['You already have the highest membership level!'],
        },
  };
}

/**
 * Lấy thời gian reset tiếp theo (00:00 ngày mai)
 */
export function getNextResetTime(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}
