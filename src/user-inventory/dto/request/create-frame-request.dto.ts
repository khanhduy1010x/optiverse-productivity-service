import { IsString, IsNotEmpty, MaxLength, IsNumber, Min, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFrameRequestDto {
  @ApiProperty({ description: 'Tên của frame', example: 'Golden Frame' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;
  
  @ApiProperty({ description: 'Giá frame (điểm)', example: 100 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  cost: number;

  @ApiProperty({ description: 'URL icon của frame', required: false })
  @IsString()
  @IsOptional()
  icon_url?: string;
}