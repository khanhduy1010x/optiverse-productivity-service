import { ApiProperty } from '@nestjs/swagger';

export class ExchangeFrameResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Thông báo kết quả' })
  message: string;

  @ApiProperty({ description: 'Số điểm còn lại', required: false })
  remainingPoints?: number;

  @ApiProperty({ description: 'ID của frame đã đổi', required: false })
  ownedFrameId?: string;
}