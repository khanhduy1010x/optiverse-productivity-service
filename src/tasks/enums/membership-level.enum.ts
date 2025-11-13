/**
 * Membership Level Enum
 * Định nghĩa các cấp độ membership
 * 
 * IMPORTANT: Mapping từ req.userInfo.membership.level:
 * - level: 0 = BASIC (khi hasActiveMembership: true)
 * - level: 1 = PLUS (khi hasActiveMembership: true)
 * - level: 2 = BUSINESS (khi hasActiveMembership: true)
 * - FREE được xác định bởi hasActiveMembership: false
 */
export enum MembershipLevel {
  BASIC = 0,
  PLUS = 1,
  BUSINESS = 2,
}

/**
 * Enum string để dễ dùng hơn
 */
export enum MembershipLevelString {
  BASIC = 'BASIC',
  PLUS = 'PLUS',
  BUSINESS = 'BUSINESS',
}

/**
 * String enum cho FREE membership (khi hasActiveMembership: false)
 */
export const FREE_MEMBERSHIP = 'FREE';
