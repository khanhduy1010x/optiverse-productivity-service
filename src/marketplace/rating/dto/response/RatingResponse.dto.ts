export class RatingResponse {
  _id: string;
  marketplace_id: string;
  user_id: string;
  user_info?: any;
  comment?: string;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}
