import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsHexColor } from 'class-validator';

export class UpdateTagRequest {
  @ApiPropertyOptional({ example: 'Work', description: 'Tên tag (tối đa 25 ký tự)' })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  name?: string;

  @ApiPropertyOptional({ example: '#3B82F6', description: 'Màu sắc của tag theo định dạng hex' })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
