import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flashcard } from './flashcard.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateFlashcardRequest } from './dto/request/CreateFlashcardRequest.dto';
import { UpdateFlashcardRequest } from './dto/request/UpdateFlashcardRequest.dto';

@Injectable()
export class FlashcardRepository {
  constructor(@InjectModel(Flashcard.name) private readonly flashcardModel: Model<Flashcard>) {}

  async getFlashcardsByDeckID(deckId: string): Promise<Flashcard[]> {
    return await this.flashcardModel
      .find({ deck_id: new Types.ObjectId(deckId) })
      .populate('reviewSession')
      .exec();
  }

  async createFlashcard(createFlashcardDto: CreateFlashcardRequest): Promise<Flashcard> {
    const newFlashcard = new this.flashcardModel({
      ...createFlashcardDto,
      deck_id: new Types.ObjectId(createFlashcardDto.deck_id),
    });
    return await newFlashcard.save();
  }

  async updateFlashcard(
    flashcardId: string,
    updateFlashcardDto: UpdateFlashcardRequest,
  ): Promise<Flashcard> {
    return await this.flashcardModel
      .findByIdAndUpdate(flashcardId, updateFlashcardDto, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteFlashcard(flashcardId: string): Promise<void> {
    const result = await this.flashcardModel.deleteOne({ _id: flashcardId }).exec();
    if (result.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }

  async deleteManyByIds(ids: string[]): Promise<void> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));

    const result = await this.flashcardModel.deleteMany({
      _id: { $in: objectIds },
    });
  }
}
