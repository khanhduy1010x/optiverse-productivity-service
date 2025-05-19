import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAchievementRequest {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  icon_url?: string;
}
