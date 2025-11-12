import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Operator, RuleCategory, ValueType, LogicOperator } from '../../achievement.schema';

export class RuleDto {
  @ApiProperty({ enum: RuleCategory })
  @IsEnum(RuleCategory)
  category: RuleCategory;

  @ApiProperty()
  @IsString()
  field: string;

  @ApiProperty({ enum: ValueType })
  @IsEnum(ValueType)
  value_type: ValueType;

  @ApiProperty({ required: false, description: 'Required for STRING/NUMBER types, optional for DATE/BOOLEAN/ENUM' })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiProperty({ enum: Operator })
  @IsEnum(Operator)
  operator: Operator;

  @ApiProperty({  required: false, description: 'Giá trị filter, nếu là DATE/NUMBER sẽ parse từ string' })
  @IsString()
  value: string;
}

export class CreateAchievementRequest {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    required: false,
    description: 'Achievement icon file upload'
  })
  @IsOptional()
  file?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon_url?: string;

  @ApiProperty({ type: [RuleDto], description: 'Array of rules or JSON string when using FormData' })
  rules: RuleDto[] | string; // Cho phép string khi sử dụng FormData, validation sẽ được xử lý trong controller

  @ApiProperty({ enum: LogicOperator, required: false, default: LogicOperator.AND })
  @IsOptional()
  @IsEnum(LogicOperator)
  logic_operator?: LogicOperator;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reward?: string;
}