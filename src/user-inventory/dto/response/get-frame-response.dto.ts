import { ApiProperty } from '@nestjs/swagger';
import { FrameResponseDto } from './frame-response.dto';

export class GetFrameResponseDto extends FrameResponseDto {
  @ApiProperty({ description: 'Thông tin chi tiết frame' })
  message?: string;
}