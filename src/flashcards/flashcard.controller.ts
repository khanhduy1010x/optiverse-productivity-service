import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { ApiResponse } from 'src/common/api-response';
import { FlashcardResponse } from './dto/response/FlashcardResponse.dto';
import { CreateFlashcardRequest } from './dto/request/CreateFlashcardRequest.dto';
import { UpdateFlashcardRequest } from './dto/request/UpdateFlashcardRequest.dto';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/flashcard')
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @ApiBody({ type: CreateFlashcardRequest })
  @Post('')
  async createFlashcard(
    @Req() req,
    @Body() createFlashcardDto: CreateFlashcardRequest,
  ): Promise<ApiResponse<FlashcardResponse>> {
    const user = req.userInfo as UserDto;
    const flashcard = await this.flashcardService.createFlashcard(user.userId, createFlashcardDto);
    return new ApiResponse<FlashcardResponse>(flashcard);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({ type: UpdateFlashcardRequest })
  @Patch('/:id')
  async updateFlashcard(
    @Param('id') flashcardId: string,
    @Body() updateFlashcardDto: UpdateFlashcardRequest,
  ): Promise<ApiResponse<FlashcardResponse>> {
    const flashcard = await this.flashcardService.updateFlashcard(flashcardId, updateFlashcardDto);
    return new ApiResponse<FlashcardResponse>(flashcard);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete('/:id')
  async deleteFlashcard(@Param('id') flashcardId: string): Promise<ApiResponse<void>> {
    await this.flashcardService.deleteFlashcard(flashcardId);
    return new ApiResponse<void>(null);
  }
}
