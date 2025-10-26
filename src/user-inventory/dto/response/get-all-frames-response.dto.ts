import { ApiProperty } from '@nestjs/swagger';
import { FrameResponseDto } from './frame-response.dto';

export class GetAllFramesResponseDto {
  @ApiProperty({ description: 'Danh sách tất cả frame trong hệ thống', type: [FrameResponseDto] })
  frames: FrameResponseDto[];

  @ApiProperty({ description: 'Tổng số frame trong hệ thống' })
  total: number;
}