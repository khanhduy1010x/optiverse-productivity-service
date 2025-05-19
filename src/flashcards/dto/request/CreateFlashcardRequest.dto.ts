import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFlashcardRequest {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  deck_id: Types.ObjectId;

  @ApiProperty({ example: 'front' })
  @IsNotEmpty()
  front: string;

  @ApiProperty({ example: 'back' })
  @IsNotEmpty()
  back: string;
}
