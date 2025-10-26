import { ApiProperty } from '@nestjs/swagger';

export class SetActiveFrameResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Thông báo kết quả' })
  message: string;
}