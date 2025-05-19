import { IsOptional } from 'class-validator';

export class UpdateAchievementRequest {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  icon_url?: string;
}
