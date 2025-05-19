import { IsOptional } from 'class-validator';

export class UpdateUserAchievementRequest {
  @IsOptional()
  claimed?: boolean;

  @IsOptional()
  claimed_at?: Date;
}
