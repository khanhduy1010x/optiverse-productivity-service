import { Share, SharedUser } from '../../share.schema';

export class UserInfoDto {
  id: string;
  name?: string;
  email: string;
  avatar_url?: string;
}

export class SharedUserResponse {
  user_id: string;
  permission: string;
  shared_at: Date;
  user_info?: UserInfoDto | null;

  constructor(sharedUser: SharedUser) {
    this.user_id = sharedUser.user_id.toString();
    this.permission = sharedUser.permission;
    this.shared_at = sharedUser.shared_at;
    // user_info sẽ được thêm sau khi tạo đối tượng
  }
}

export class ShareResponse {
  id: string;
  owner_id: string;
  resource_type: string;
  resource_id: string;
  shared_with: SharedUserResponse[];
  createdAt: Date;
  updatedAt: Date;

  constructor(share: Share) {
    this.id = share._id.toString();
    this.owner_id = share.owner_id.toString();
    this.resource_type = share.resource_type;
    this.resource_id = share.resource_id.toString();
    this.shared_with = share.shared_with.map(
      (user) => new SharedUserResponse(user),
    );
    this.createdAt = share['createdAt'];
    this.updatedAt = share['updatedAt'];
  }
}
