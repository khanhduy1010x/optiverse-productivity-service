import { ApiProperty } from '@nestjs/swagger';
import { FrameResponseDto } from './frame-response.dto';

export class DeleteFrameResponseDto {
  @ApiProperty({ description: 'Thông báo kết quả' })
  message: string;

  @ApiProperty({ description: 'Thông tin frame đã xóa', type: FrameResponseDto })
  deletedFrame: {
    _id: string;
    title: string;
    icon_url?: string;
    cost: number;
  };
}