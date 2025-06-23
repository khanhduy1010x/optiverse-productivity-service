import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ConditionTypeEnum } from '../../achievement-type.schema';

export class CreateAchievementTypeRequest {
  @IsNotEmpty()
  @IsMongoId()
  achievement_id: string;

  @IsNotEmpty()
  @IsEnum(ConditionTypeEnum)
  condition_type: ConditionTypeEnum;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  condition_value: number;
} 