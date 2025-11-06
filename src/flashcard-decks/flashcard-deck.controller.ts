import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  Patch,
} from '@nestjs/common';
import { FlashcardDeckService } from './flashcard-deck.service';
import { ApiResponse } from 'src/common/api-response';
import { FlashcardDeckResponse } from './dto/response/FlashcardDeckResponse.dto';
import { CreateFlashcardDeckRequest } from './dto/request/CreateFlashcardDeckRequest.dto';
import { UpdateFlashcardDeckRequest } from './dto/request/UpdateFlashcardDeckRequest.dto';
import { FlashcardDeck } from './flashcard-deck.schema';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
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
}
