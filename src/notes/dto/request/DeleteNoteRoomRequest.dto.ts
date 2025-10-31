import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteNoteRoomRequest {
  @ApiProperty({
    example: '665f1f77bcf86cd799439012',
    description: 'Note ID to delete',
  })
  @IsMongoId()
  @IsNotEmpty()
  note_id: string;

  @ApiProperty({
    example: '665f1f77bcf86cd799439011',
    description: 'Live room id',
  })
  @IsMongoId()
  live_room_id: string;
}
