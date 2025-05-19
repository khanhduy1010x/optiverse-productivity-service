import { Friend } from '../../friend.schema';

export class FriendResponse {
  friend: Friend;

  constructor(friend: Friend) {
    this.friend = friend;
  }
}
