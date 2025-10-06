import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Operator, RuleCategory, ValueType, LogicOperator } from '../../achievement.schema';

export class RuleUpdateDto {
  @ApiPropertyOptional({ enum: RuleCategory })
  @IsOptional()
  @IsEnum(RuleCategory)
  category?: RuleCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional({ enum: ValueType })
  @IsOptional()
  @IsEnum(ValueType)
  value_type?: ValueType;

  @ApiPropertyOptional({ description: 'Required for STRING/NUMBER types, optional for DATE/BOOLEAN/ENUM' })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiPropertyOptional({ enum: Operator })
  @IsOptional()
  @IsEnum(Operator)
  operator?: Operator;

  @ApiPropertyOptional({ description: 'Giá trị filter, nếu là DATE/NUMBER sẽ parse từ string' })
  @IsOptional()
  @IsString()
  value?: string;
}

export class UpdateAchievementRequest {
  @ApiPropertyOptional({ 
    type: 'string', 
    format: 'binary', 
    description: 'Achievement icon file upload'
  })
  @IsOptional()
  file?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon_url?: string;

  @ApiPropertyOptional({ type: [RuleUpdateDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleUpdateDto)
  rules?: RuleUpdateDto[] | string; // Cho phép string khi sử dụng FormData

  @ApiPropertyOptional({ enum: LogicOperator })
  @IsOptional()
  @IsEnum(LogicOperator)
  logic_operator?: LogicOperator;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reward?: string;
}