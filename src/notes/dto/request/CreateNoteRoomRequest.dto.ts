import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateNoteRoomRequest {
  @ApiProperty({ example: 'Weekly sync notes' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '665f1f77bcf86cd799439011',
    description: 'Live room id',
  })
  @IsMongoId()
  live_room_id: string;
}
