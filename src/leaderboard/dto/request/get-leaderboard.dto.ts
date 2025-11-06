import { IsEnum, IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export enum TimePeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum RankingMetric {
  TOTAL_PRODUCTS = 'total_products',
  TOTAL_SPENDING = 'total_spending',
}

export class GetLeaderboardDto {
  @IsEnum(TimePeriod, { message: 'Time period must be either "weekly" or "monthly"' })
  @IsOptional()
  timePeriod?: TimePeriod = TimePeriod.MONTHLY;

  @IsEnum(RankingMetric, { message: 'Ranking metric must be either "total_products" or "total_spending"' })
  @IsOptional()
  metric?: RankingMetric = RankingMetric.TOTAL_SPENDING;

  @Type(() => Number)
  @IsNumber()
  @IsInt()
  @Min(1, { message: 'Page must not be less than 1' })
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsInt()
  @Min(1, { message: 'Limit must not be less than 1' })
  @Max(100, { message: 'Limit must not be greater than 100' })
  @IsOptional()
  limit?: number = 10;
}
