import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserAchievementRequest {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  achievement_id: string;
}
