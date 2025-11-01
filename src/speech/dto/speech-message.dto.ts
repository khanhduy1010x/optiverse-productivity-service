import { ApiProperty } from '@nestjs/swagger';

export class SpeechMessageDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  room_id?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  user_id?: string;

  @ApiProperty({ example: 'Khánh Duy' })
  speaker_name: string;

  @ApiProperty({ example: 'Xin chào mọi người' })
  text: string;

  @ApiProperty({ example: '2025-10-25T10:00:00Z' })
  createdAt?: Date;

  @ApiProperty({
    example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user123',
    required: false,
  })
  avatar_url?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  user_email?: string;
}
