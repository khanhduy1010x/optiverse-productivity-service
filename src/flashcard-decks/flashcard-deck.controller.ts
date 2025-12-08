import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FlashcardDeckService } from './flashcard-deck.service';
import { ApiResponse } from 'src/common/api-response';
import { FlashcardDeckResponse } from './dto/response/FlashcardDeckResponse.dto';
import { CreateFlashcardDeckRequest } from './dto/request/CreateFlashcardDeckRequest.dto';
import { UpdateFlashcardDeckRequest } from './dto/request/UpdateFlashcardDeckRequest.dto';
import { GenerateFlashcardsFromPdfRequest, FlashcardFormat } from './dto/request/GenerateFlashcardsFromPdfRequest.dto';
import { GeneratedFlashcardsResponse } from './dto/response/GeneratedFlashcardsResponse.dto';
import { FlashcardDeck } from './flashcard-deck.schema';
import { ApiBearerAuth, ApiBody, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/flashcard-deck')
export class FlashcardDeckController {
  constructor(private readonly flashcardDeckService: FlashcardDeckService) {}

  @Get('all')
  async getFlashcardDecksByUserID(@Request() req): Promise<ApiResponse<FlashcardDeck[]>> {
    const user = req.userInfo as UserDto;

    const flashcardDecks = await this.flashcardDeckService.getFlashcardDecksByUserID(user.userId);
    return new ApiResponse<any[]>(flashcardDecks);
  }

  @Get('workspace/:workspaceId')
  async getFlashcardDecksByWorkspaceID(
    @Param('workspaceId') workspaceId: string,
  ): Promise<ApiResponse<FlashcardDeck[]>> {
    const flashcardDecks = await this.flashcardDeckService.getFlashcardDecksByWorkspaceID(workspaceId);
    return new ApiResponse<any[]>(flashcardDecks);
  }

  @Get('workspace/:workspaceId/statistics')
  async getStatisticsByWorkspaceID(
    @Request() req,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ApiResponse<any>> {
    const user = req.userInfo as UserDto;

    const basicStatistic = await this.flashcardDeckService.getStatisticsByWorkspaceID(workspaceId, user.userId);
    const reviewsByDay = await this.flashcardDeckService.getReviewsByDayByWorkspace(workspaceId, user.userId);
    const dueTodayPerDeck = await this.flashcardDeckService.getDueTodayPerDeckByWorkspace(workspaceId, user.userId);
    return new ApiResponse<any>({
      ...basicStatistic,
      reviewsByDay,
      dueTodayPerDeck
    });
  }

  @Get('statistics')
  async getStatisticsByUserID(@Request() req): Promise<ApiResponse<any>> {
    const user = req.userInfo as UserDto;

    const basicStatistic = await this.flashcardDeckService.getStatisticsByUserID(user.userId);
    const reviewsByDay = await this.flashcardDeckService.getReviewsByDayByUserID(user.userId);
    const dueTodayPerDeck = await this.flashcardDeckService.getDueTodayPerDeck(user.userId);
    return new ApiResponse<any>({
      ...basicStatistic,
      reviewsByDay,
      dueTodayPerDeck
    });
  }

  @Get(':id')
  async getFlashcardDeckById(
    @Param('id') flashcardDeckId: string,
  ): Promise<ApiResponse<FlashcardDeck | null>> {
    const flashcardDeck = await this.flashcardDeckService.getFlashcardDeckById(flashcardDeckId);
    return new ApiResponse<any>(flashcardDeck);
  }

  @ApiBody({ type: CreateFlashcardDeckRequest })
  @Post('')
  async createFlashcardDeck(
    @Request() req,
    @Body() createFlashcardDeckDto: CreateFlashcardDeckRequest,
  ): Promise<ApiResponse<FlashcardDeckResponse>> {
    const user = req.userInfo as UserDto;
    const flashcardDeck = await this.flashcardDeckService.createFlashcardDeck(
      createFlashcardDeckDto,
      user.userId,
    );
    return new ApiResponse<FlashcardDeckResponse>(flashcardDeck);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({ type: UpdateFlashcardDeckRequest })
  @Patch('/:id')
  async updateFlashcardDeck(
    @Param('id') flashcardDeckId: string,
    @Body() updateFlashcardDeckDto: UpdateFlashcardDeckRequest,
  ): Promise<ApiResponse<FlashcardDeckResponse>> {
    const flashcardDeck = await this.flashcardDeckService.updateFlashcardDeck(
      flashcardDeckId,
      updateFlashcardDeckDto,
    );
    return new ApiResponse<FlashcardDeckResponse>(flashcardDeck);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Post('/:id/duplicate')
  async duplicateFlashcardDeck(
    @Param('id') flashcardDeckId: string,
    @Request() req,
  ): Promise<ApiResponse<FlashcardDeckResponse>> {
    const user = req.userInfo as UserDto;
    const duplicatedDeck = await this.flashcardDeckService.duplicateFlashcardDeck(flashcardDeckId, user.userId);
    return new ApiResponse<FlashcardDeckResponse>(duplicatedDeck);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete('/:id')
  async deleteFlashcardDeck(@Param('id') flashcardDeckId: string): Promise<ApiResponse<void>> {
    await this.flashcardDeckService.deleteFlashcardDeck(flashcardDeckId);
    return new ApiResponse<void>(null);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to extract text from',
        },
        deckTitle: {
          type: 'string',
          example: 'My Flashcard Deck',
          description: 'Title for the new flashcard deck',
        },
        description: {
          type: 'string',
          example: 'Description of the deck',
          description: 'Optional description for the deck',
        },
        workspace_id: {
          type: 'string',
          description: 'Optional workspace ID',
        },
        numFlashcards: {
          type: 'number',
          example: 10,
          description: 'Number of flashcards to generate (default: 10)',
        },
        format: {
          type: 'string',
          enum: ['qa', 'vocabulary', 'true_false', 'fill_blank'],
          example: 'qa',
          description: 'Format of flashcards to generate: qa (Question & Answer), vocabulary (Word & Definition), true_false (True/False), fill_blank (Fill in the Blank). Default: qa',
        },
      },
      required: ['file', 'deckTitle'],
    },
  })
  @Post('generate-from-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async generateFlashcardsFromPdf(
    @Request() req,
    @UploadedFile() file: any,
    @Body() body: any,
  ): Promise<ApiResponse<GeneratedFlashcardsResponse>> {
    const user = req.userInfo as UserDto;

    // Validate file
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File must be a PDF');
    }

    if (!body.deckTitle) {
      throw new BadRequestException('deckTitle is required');
    }

    const numFlashcards = body.numFlashcards ? parseInt(body.numFlashcards, 10) : 10;

    if (numFlashcards < 1 || numFlashcards > 100) {
      throw new BadRequestException('numFlashcards must be between 1 and 100');
    }

    // Validate and parse format
    let format = FlashcardFormat.QA;
    if (body.format) {
      const validFormats = Object.values(FlashcardFormat);
      if (!validFormats.includes(body.format)) {
        throw new BadRequestException(
          `Invalid format. Allowed values: ${validFormats.join(', ')}`,
        );
      }
      format = body.format;
    }

    const result = await this.flashcardDeckService.generateFlashcardsFromPdf(
      file.buffer,
      body.deckTitle,
      user.userId,
      body.description,
      body.workspace_id,
      numFlashcards,
      format,
    );

    return new ApiResponse<GeneratedFlashcardsResponse>(result);
  }
}
