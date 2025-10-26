import { ApiProperty } from '@nestjs/swagger';
import { FrameResponseDto } from './frame-response.dto';

export class CreateFrameResponseDto extends FrameResponseDto {
  @ApiProperty({ description: 'Thông báo tạo thành công' })
  message?: string;
}