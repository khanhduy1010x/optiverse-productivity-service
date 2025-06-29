import { ReviewSessionService } from './review-session.service';
import { ApiResponse } from 'src/common/api-response';
import { ReviewSessionResponse } from './dto/response/ReviewSessionResponse.dto';
import { ReviewRequestDto } from './dto/request/ReviewRequest.dto';
export declare class ReviewSessionController {
    private readonly reviewSessionService;
    constructor(reviewSessionService: ReviewSessionService);
    reviewFlashcard(req: any, dto: ReviewRequestDto): Promise<ApiResponse<ReviewSessionResponse>>;
    getReviewSessionsByUserID(req: any): Promise<ApiResponse<ReviewSessionResponse[]>>;
}
