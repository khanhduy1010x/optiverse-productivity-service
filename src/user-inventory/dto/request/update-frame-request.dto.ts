import { IsString, IsOptional, MaxLength, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFrameRequestDto {
  @ApiProperty({ description: 'Tên của frame', required: false, example: 'Golden Frame Updated' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: 'Giá frame (điểm)', required: false, example: 150 })
  @Transform(({ value }) => value ? parseInt(value) : value)
  @IsNumber()
  @IsOptional()
  @Min(1)
  cost?: number;

  @ApiProperty({ description: 'URL icon của frame', required: false })
  @IsString()
  @IsOptional()
  icon_url?: string;
}