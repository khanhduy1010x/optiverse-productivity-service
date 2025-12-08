import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class GenerateFlashcardsFromPdfRequest {
  @ApiProperty({ type: 'string', format: 'binary', description: 'PDF file to extract text from' })
  @IsNotEmpty()
  file: any;

  @ApiProperty({ example: 'My Flashcard Deck', description: 'Title for the new flashcard deck' })
  @IsNotEmpty()
  @IsString()
  deckTitle: string;

  @ApiProperty({
    example: 'Description of the flashcard deck',
    description: 'Optional description for the deck',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'workspace_id',
    description: 'Optional workspace ID',
    required: false,
  })
  @IsOptional()
  workspace_id?: string | Types.ObjectId;

  @ApiProperty({
    example: 10,
    description: 'Number of flashcards to generate (default: 10)',
    required: false,
  })
  @IsOptional()
  numFlashcards?: number;
}
