import { ReviewSession } from '../../review-session.schema';

export class ReviewSessionResponse {
  reviewSession: ReviewSession;

  constructor(reviewSession: ReviewSession) {
    this.reviewSession = reviewSession;
  }
}
