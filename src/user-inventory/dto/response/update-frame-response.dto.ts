import { ApiProperty } from '@nestjs/swagger';
import { FrameResponseDto } from './frame-response.dto';

export class UpdateFrameResponseDto extends FrameResponseDto {
  @ApiProperty({ description: 'Thông báo cập nhật thành công' })
  message?: string;
}