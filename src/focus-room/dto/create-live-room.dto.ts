import { IsString, IsOptional, IsEnum, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccessType } from '../schemas/live-room.schema';

export class CreateLiveRoomDto {
  @ApiProperty({ description: 'Tên phòng', example: 'Cuộc họp hôm nay' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({
    description: 'ID workspace',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  workspace_id?: string;

  @ApiProperty({
    description: 'Loại truy cập',
    enum: AccessType,
    default: AccessType.PUBLIC,
  })
  @IsOptional()
  @IsEnum(AccessType)
  access_type?: AccessType;

  @ApiProperty({
    description: 'Mật khẩu phòng (chỉ dùng khi private)',
    example: 'abc123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Mô tả phòng',
    example: 'Phòng họp dự án X',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
