import { ApiProperty } from '@nestjs/swagger';
import { FrameResponseDto } from './frame-response.dto';

export class UserFramesResponseDto {
  @ApiProperty({ description: 'Danh sách frame mà user sở hữu', type: [FrameResponseDto] })
  frames: FrameResponseDto[];

  @ApiProperty({ description: 'Frame đang active của user', required: false })
  activeFrame?: string;

  @ApiProperty({ description: 'Số điểm hiện tại của user' })
  userPoints: number;

  @ApiProperty({ description: 'Tổng số frame mà user sở hữu' })
  total: number;
}