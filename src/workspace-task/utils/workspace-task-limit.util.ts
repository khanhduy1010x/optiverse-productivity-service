import { MembershipLevel } from '../../tasks/enums/membership-level.enum';

/**
 * Mapping workspace task limit theo membership level
 * Giới hạn số lượng workspace task có thể tạo trong 1 ngày (từ 00:00 đến 23:59)
 * Tính riêng cho từng workspace dựa trên membership của owner workspace đó
 */
const WORKSPACE_TASK_LIMIT_BY_MEMBERSHIP: Record<MembershipLevel, number> = {
  [MembershipLevel.BASIC]: 20,
  [MembershipLevel.PLUS]: 50,
  [MembershipLevel.BUSINESS]: Infinity, // Unlimited
};

/**
 * Workspace task limit cho FREE membership (khi hasActiveMembership: false)
 */
const FREE_WORKSPACE_TASK_LIMIT = 10;

/**
 * Lấy giới hạn workspace task theo membership level của owner workspace
 * 
 * Logic:
 * - Nếu hasActiveMembership: false → FREE (10 tasks)
 * - Nếu hasActiveMembership: true:
 *   - level 0 → BASIC (20 tasks)
 *   - level 1 → PLUS (50 tasks)
 *   - level 2 → BUSINESS (Unlimited)
 *   - level khác → FREE (10 tasks) - invalid level được coi là FREE
 * 
 * @param membershipLevel - Level membership của owner workspace (0=BASIC, 1=PLUS, 2=BUSINESS)
 * @param hasActiveMembership - Nếu false thì owner là FREE membership, bất kể level
 * @returns Số lượng workspace task có thể tạo trong 1 ngày cho workspace đó
 */
export function getWorkspaceTaskLimitByMembershipLevel(membershipLevel: number, hasActiveMembership: boolean = true): number {
  // Prioritize hasActiveMembership: nếu false thì luôn return FREE, không xét level
  if (!hasActiveMembership) {
    console.log('[getWorkspaceTaskLimitByMembershipLevel] hasActiveMembership: false → FREE (10 tasks)');
    return FREE_WORKSPACE_TASK_LIMIT;
  }

  // Khi hasActiveMembership: true, xét level để quyết định tier
  // Chỉ chấp nhận level 0, 1, 2 - nếu level khác thì coi là FREE
  if (!Number.isInteger(membershipLevel) || membershipLevel < 0 || membershipLevel > 2) {
    console.log(`[getWorkspaceTaskLimitByMembershipLevel] hasActiveMembership: true nhưng level ${membershipLevel} không hợp lệ → FREE (10 tasks)`);
    return FREE_WORKSPACE_TASK_LIMIT;
  }

  const limit = WORKSPACE_TASK_LIMIT_BY_MEMBERSHIP[membershipLevel as MembershipLevel];
  console.log(`[getWorkspaceTaskLimitByMembershipLevel] hasActiveMembership: true + level ${membershipLevel} → ${membershipLevel === 0 ? 'BASIC (20 tasks)' : membershipLevel === 1 ? 'PLUS (50 tasks)' : 'BUSINESS (Unlimited)'}`);
  
  return limit;
}

/**
 * Check xem có thể tạo workspace task không dựa trên giới hạn ngày
 * 
 * Hoạt động cho tất cả membership levels của owner workspace:
 * - FREE (hasActiveMembership: false): limit 10 tasks/ngày
 * - BASIC (level 0, hasActiveMembership: true): limit 20 tasks/ngày
 * - PLUS (level 1, hasActiveMembership: true): limit 50 tasks/ngày
 * - BUSINESS (level 2, hasActiveMembership: true): limit Infinity → luôn return true
 * - Invalid level + hasActiveMembership: true → coi là FREE (limit 10)
 * 
 * @param tasksCreatedToday - Số workspace task đã tạo hôm nay trong workspace
 * @param membershipLevel - Level membership của owner workspace (0=BASIC, 1=PLUS, 2=BUSINESS)
 * @param hasActiveMembership - Nếu false thì owner là FREE membership, bất kể level
 * @returns true nếu có thể tạo task, false nếu đã đạt giới hạn
 */
export function canCreateWorkspaceTask(tasksCreatedToday: number, membershipLevel: number, hasActiveMembership: boolean = true): boolean {
  const limit = getWorkspaceTaskLimitByMembershipLevel(membershipLevel, hasActiveMembership);
  
  // Nếu limit là Infinity (BUSINESS), luôn cho phép
  if (!isFinite(limit)) {
    console.log('[canCreateWorkspaceTask] Limit is Infinity (BUSINESS) → allowing creation');
    return true;
  }
  
  const canCreate = tasksCreatedToday < limit;
  console.log(`[canCreateWorkspaceTask] CHECK: tasksCreatedToday=${tasksCreatedToday} < limit=${limit} = ${canCreate} (${canCreate ? '✅ CAN CREATE' : '❌ CANNOT CREATE'})`);
  
  return canCreate;
}

/**
 * Lấy tin nhắn lỗi khi vượt giới hạn workspace task
 * @param membershipLevel - Level membership của owner workspace (0=BASIC, 1=PLUS, 2=BUSINESS)
 * @param hasActiveMembership - Nếu false thì owner là FREE membership
 * @returns Tin nhắn lỗi
 */
export function getWorkspaceTaskLimitErrorMessage(membershipLevel: number, hasActiveMembership: boolean = true): string {
  const limit = getWorkspaceTaskLimitByMembershipLevel(membershipLevel, hasActiveMembership);

  if (!isFinite(limit)) {
    return 'Unlimited workspace tasks allowed'; // Không nên gặp tình huống này
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

  return `You have reached the daily workspace task limit of ${limit} tasks for ${membershipName} membership. Please upgrade your membership to create more tasks.`;
}

/**
 * Mapping membership level description cho workspace task
 */
export const WORKSPACE_TASK_MEMBERSHIP_LEVEL_DESCRIPTIONS: Record<number, { name: string; dailyLimit: number | string }> = {
  0: { name: 'BASIC', dailyLimit: 20 },
  1: { name: 'PLUS', dailyLimit: 50 },
  2: { name: 'BUSINESS', dailyLimit: 'Unlimited' },
};

/**
 * Description cho FREE membership workspace task
 */
export const FREE_WORKSPACE_TASK_MEMBERSHIP_DESCRIPTION = { name: 'FREE', dailyLimit: 10 };

/**
 * Lấy upgrade suggestion dựa trên membership level hiện tại của owner workspace
 * @param currentMembershipLevel - Level membership hiện tại (0=BASIC, 1=PLUS, 2=BUSINESS)
 * @param hasActiveMembership - Nếu false thì owner là FREE membership
 * @returns Gợi ý upgrade với thông tin membership level tiếp theo
 */
export function getWorkspaceTaskUpgradeSuggestion(currentMembershipLevel: number, hasActiveMembership: boolean = true): {
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
      nextLevel: null, // Already at max level
    },
  };

  // Determine current membership key
  let currentLevelKey: string;
  if (!hasActiveMembership) {
    currentLevelKey = 'FREE';
  } else {
    // Map level number to key
    const levelToKey: Record<number, string> = {
      0: 'BASIC',
      1: 'PLUS',
      2: 'BUSINESS',
    };
    currentLevelKey = levelToKey[currentMembershipLevel] || 'FREE';
  }

  const currentMembership = membershipLevelMap[currentLevelKey as keyof typeof membershipLevelMap];

  if (!currentMembership || !currentMembership.nextLevel) {
    return null; // Already at highest level or invalid level
  }

  const nextMembership = membershipLevelMap[currentMembership.nextLevel as keyof typeof membershipLevelMap];

  return {
    currentLevel: currentMembership.name,
    currentLimit: currentMembership.limit,
    suggestedLevel: nextMembership.name,
    suggestedLimit: nextMembership.limit,
    limitIncrease: isFinite(nextMembership.limit) && isFinite(currentMembership.limit)
      ? nextMembership.limit - currentMembership.limit
      : Infinity,
  };
}

/**
 * Lấy response chi tiết khi vượt giới hạn workspace task
 * @param membershipLevel - Level membership của owner workspace
 * @param tasksCreatedToday - Số workspace task đã tạo hôm nay trong workspace
 * @param hasActiveMembership - Nếu false thì owner là FREE membership
 * @returns Object chứa thông tin lỗi chi tiết với upgrade suggestion
 */
export function getDetailedWorkspaceTaskLimitExceededResponse(
  membershipLevel: number,
  tasksCreatedToday: number,
  hasActiveMembership: boolean = true,
): {
  code: number;
  statusCode: number;
  message: string;
  error: string;
  details: {
    tasksCreatedToday: number;
    currentLimit: number;
    membershipLevel: string;
  };
  upgrade: {
    suggestion: string;
    currentLevel: string;
    suggestedLevel: string;
    suggestedLimit: number | string;
    limitIncrease: number | string;
  } | null;
} {
  const limit = getWorkspaceTaskLimitByMembershipLevel(membershipLevel, hasActiveMembership);
  const upgradeSuggestion = getWorkspaceTaskUpgradeSuggestion(membershipLevel, hasActiveMembership);

  // Determine membership name
  let membershipName: string;
  if (!hasActiveMembership) {
    membershipName = 'FREE';
  } else {
    const membershipNames: Record<number, string> = {
      0: 'BASIC',
      1: 'PLUS',
      2: 'BUSINESS',
    };
    membershipName = membershipNames[membershipLevel] || 'Unknown';
  }

  return {
    code: 400,
    statusCode: 400,
    message: getWorkspaceTaskLimitErrorMessage(membershipLevel, hasActiveMembership),
    error: 'WORKSPACE_TASK_LIMIT_EXCEEDED',
    details: {
      tasksCreatedToday,
      currentLimit: isFinite(limit) ? limit : 999999, // Use large number for display
      membershipLevel: membershipName,
    },
    upgrade: upgradeSuggestion
      ? {
          suggestion: `Upgrade to ${upgradeSuggestion.suggestedLevel} to increase your daily workspace task limit from ${upgradeSuggestion.currentLimit} to ${isFinite(upgradeSuggestion.suggestedLimit) ? upgradeSuggestion.suggestedLimit : 'Unlimited'} tasks.`,
          currentLevel: upgradeSuggestion.currentLevel,
          suggestedLevel: upgradeSuggestion.suggestedLevel,
          suggestedLimit: upgradeSuggestion.suggestedLimit,
          limitIncrease: isFinite(upgradeSuggestion.limitIncrease) ? upgradeSuggestion.limitIncrease : 'Unlimited',
        }
      : null,
  };
}
