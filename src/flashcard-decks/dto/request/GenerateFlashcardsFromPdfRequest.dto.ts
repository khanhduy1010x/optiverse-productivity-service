import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { Types } from 'mongoose';

export enum FlashcardFormat {
  QA = 'qa',                    // Question & Answer
  VOCABULARY = 'vocabulary',    // Word & Definition
  TRUE_FALSE = 'true_false',    // True/False Statements
  FILL_BLANK = 'fill_blank',    // Fill in the Blank
}

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

  @ApiProperty({
    enum: FlashcardFormat,
    example: FlashcardFormat.QA,
    description: 'Format of flashcards to generate. Options: qa (Question & Answer), vocabulary (Word & Definition), true_false (True/False), fill_blank (Fill in the Blank)',
    required: false,
  })
  @IsOptional()
  @IsEnum(FlashcardFormat)
  format?: FlashcardFormat;
}
