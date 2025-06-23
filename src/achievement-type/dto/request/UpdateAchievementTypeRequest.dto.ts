import { IsEnum, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';
import { ConditionTypeEnum } from '../../achievement-type.schema';

export class UpdateAchievementTypeRequest {
  @IsOptional()
  @IsMongoId()
  achievement_id?: string;

  @IsOptional()
  @IsEnum(ConditionTypeEnum)
  condition_type?: ConditionTypeEnum;

  @IsOptional()
  @IsNumber()
  @Min(1)
  condition_value?: number;
} 