import { ApiProperty } from '@nestjs/swagger';

export class FrameResponseDto {
  @ApiProperty({ description: 'ID của frame' })
  _id: string;

  @ApiProperty({ description: 'Tên của frame' })
  title: string;

  @ApiProperty({ description: 'URL icon của frame', required: false })
  icon_url?: string;

  @ApiProperty({ description: 'Giá frame (điểm)' })
  cost: number;
}