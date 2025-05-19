import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserAchievementRequest {
  @IsNotEmpty()
  user_id: Types.ObjectId;

  @IsNotEmpty()
  achievement_id: Types.ObjectId;

  @IsOptional()
  achieved_at?: Date;
}
