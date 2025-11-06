export class LeaderboardEntryDto {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  totalProducts: number;
  totalSpending: number;
  score: number; // The metric being ranked by
  period: string;

  constructor(data: Partial<LeaderboardEntryDto>) {
    Object.assign(this, data);
  }
}

export class LeaderboardResponseDto {
  entries: LeaderboardEntryDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  timePeriod: string;
  metric: string;

  constructor(data: Partial<LeaderboardResponseDto>) {
    Object.assign(this, data);
    this.totalPages = Math.ceil(this.total / this.limit);
  }
}
