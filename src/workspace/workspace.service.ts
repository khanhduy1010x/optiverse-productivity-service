import { Injectable, Inject } from '@nestjs/common';
import { WorkspaceRepository } from './workspace.repository';
import { PermissionService, Permission } from './permission.service';
import { WorkspacePermissionService } from './workspace-permission.service';
import { Workspace } from './workspace.schema';
import { WorkspaceMember } from './workspace-member.schema';
import { WorkspaceJoinRequest } from './workspace-join-request.schema';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JoinWorkspaceDto } from './dto/join-workspace.dto';
import { JoinWorkspaceWithPasswordDto } from './dto/join-workspace-with-password.dto';
import { WorkspaceDetailDto } from './dto/workspace-detail.dto';
import {
  JoinRequestResponseDto,
  UserInfoDto,
  WorkspaceInfoDto,
} from './dto/join-request-response.dto';
import {
  WorkspaceSearchResponseDto,
  WorkspaceSearchDto,
  OwnerInfoDto,
} from './dto/workspace-search-response.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { UserHttpClient } from 'src/http-axios/user-http.client';
import { WorkspaceWebSocketGateway } from './workspace-websocket.gateway';
import { UserDto } from 'src/user-dto/user.dto';

interface UserResponse {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}
const workspaceLimits = {
  Free: 1,
  '0': 3, // BASIC
  '1': 8, // PROFESSIONAL
  '2': 20, // BUSINESS
};
@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly permissionService: PermissionService,
    private readonly workspacePermissionService: WorkspacePermissionService,
    private readonly userHttpClient: UserHttpClient,
    private readonly workspaceGateway: WorkspaceWebSocketGateway,
  ) {}

  async createWorkspace(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto,
    userInfo: UserDto,
  ): Promise<Workspace> {
    await this.checkWorkspaceLimits(userInfo);

    const workspace = await this.workspaceRepository.createWorkspace(
      userId,
      createWorkspaceDto.name,
      createWorkspaceDto.description || '',
      createWorkspaceDto.password,
    );

    await this.workspaceRepository.addMember(
      workspace._id.toString(),
      userId,
      'admin',
    );

    await this.workspacePermissionService.createDefaultPermissions(
      workspace._id.toString(),
      userId,
      'admin',
    );

    if (createWorkspaceDto.memberIds && createWorkspaceDto.memberIds.length) {
      const uniqueIds = Array.from(
        new Set(
          createWorkspaceDto.memberIds.filter((id) => id && id !== userId),
        ),
      );

      if (uniqueIds.length > 0) {
        try {
          for (const memberId of uniqueIds) {
            if (!memberId || memberId.trim() === '') {
              console.warn('Skipping invalid member ID:', memberId);
              continue;
            }
            await this.workspaceRepository.createJoinRequest(
              workspace._id.toString(),
              memberId,
              userId,
              'invite',
              'You have been invited to join this workspace',
            );
          }
        } catch (e) {
          console.error('Failed to create initial invitations:', e);
        }
      }
    }

    return workspace;
  }

  /**
   * Check if user can create more workspaces based on their membership package
   */
  private async checkWorkspaceLimits(user: UserDto): Promise<void> {
    const currentWorkspaceCount =
      await this.workspaceRepository.getUserWorkspaceCount(user.userId);

    console.log('ALO ALO ', currentWorkspaceCount);
    let maxWorkspaces: number;

    if (!user.membership || !user.membership.hasActiveMembership) {
      maxWorkspaces = workspaceLimits['Free'];
    } else {
      maxWorkspaces =
        workspaceLimits[String(user.membership.level)] ||
        workspaceLimits['Free'];
    }

    console.log(
      `User ${user.userId} has ${currentWorkspaceCount} workspaces, max allowed: ${maxWorkspaces}, membership level: ${user?.membership?.level}, package: ${user.membership?.packageName}`,
    );

    if (currentWorkspaceCount >= maxWorkspaces) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }
  }

  /**
   * Get workspace creation limits for user based on membership
   */
  async getWorkspaceLimits(user: UserDto): Promise<{
    current: number;
    max: number;
    canCreateMore: boolean;
    membershipLevel: string;
    packageName?: string;
  }> {
    const currentWorkspaceCount =
      await this.workspaceRepository.getUserWorkspaceCount(user.userId);

    let maxWorkspaces: number;
    let membershipLevel: string;
    console.log('User membership info:', user);
    if (!user.membership || !user.membership.hasActiveMembership) {
      maxWorkspaces = workspaceLimits['Free'];
      membershipLevel = 'Free';
    } else {
      maxWorkspaces =
        workspaceLimits[String(user.membership.level)] ||
        workspaceLimits['Free'];
      membershipLevel =
        user.membership.packageName || `Level ${user.membership.level}`;
    }

    return {
      current: currentWorkspaceCount,
      max: maxWorkspaces,
      canCreateMore: currentWorkspaceCount < maxWorkspaces,
      membershipLevel,
      packageName: user.membership?.packageName,
    };
  }

  async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    return await this.workspaceRepository.getWorkspaceById(workspaceId);
  }

  async getWorkspaceDetail(
    workspaceId: string,
    requestUserId?: string,
  ): Promise<WorkspaceDetailDto> {
    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);
    console.log('Workspace info:', workspace);

    const [members, joinRequests] = await Promise.all([
      this.workspaceRepository.getMembersByWorkspace(workspaceId),
      this.workspaceRepository.getJoinRequestsByWorkspace(workspaceId),
    ]);

    const memberUserIds = members.map((m) => m.user_id.toString());
    const requestUserIds = joinRequests.map((r) => r.target_user_id.toString());
    const allUserIds = [...memberUserIds, ...requestUserIds];

    let users: any[] = [];
    if (allUserIds.length > 0) {
      try {
        users = await this.userHttpClient.getUsersByIds(allUserIds);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    }

    const userMap = new Map<string, any>();
    users.forEach((user) => {
      userMap.set(user.user_id, user);
    });

    const memberWorkspacePermissions = new Map<string, string[]>();

    for (const userId of memberUserIds) {
      try {
        const workspacePermissions =
          await this.workspacePermissionService.getUserWorkspacePermissions(
            workspaceId,
            userId,
          );

        const workspaceActionMap: { [key: string]: string } = {
          ROOM_ADMIN: 'room_admin',
          ROOM_USER: 'room_user',
        };

        let workspaceActions: string[] = [];
        if (workspacePermissions && workspacePermissions.actions) {
          workspaceActions = workspacePermissions.actions.map(
            (action) => workspaceActionMap[action] || action,
          );
        }

        memberWorkspacePermissions.set(userId, workspaceActions);
      } catch (error) {
        console.error(
          `Failed to fetch workspace permissions for user ${userId}:`,
          error,
        );
        memberWorkspacePermissions.set(userId, []);
      }
    }

    const activeMembers = members
      .filter((m) => m.status === 'active')
      .map((member) => {
        const user = userMap.get(member.user_id.toString());
        const userWorkspacePermissions =
          memberWorkspacePermissions.get(member.user_id.toString()) || [];
        const allPermissions = [
          ...new Set([
            ...(member.permissions || []),
            ...userWorkspacePermissions,
          ]),
        ];

        return {
          user_id: member.user_id.toString(),
          email: user?.email || '',
          full_name: user?.full_name || '',
          avatar_url: user?.avatar_url || '',
          role: member.role,
          status: member.status,
          time: member.joined_at,
          permissions: allPermissions,
        };
      });

    const bannedMembers = members
      .filter((m) => m.status === 'banned')
      .map((member) => {
        const user = userMap.get(member.user_id.toString());
        const userWorkspacePermissions =
          memberWorkspacePermissions.get(member.user_id.toString()) || [];
        const allPermissions = [
          ...new Set([
            ...(member.permissions || []),
            ...userWorkspacePermissions,
          ]),
        ];

        return {
          user_id: member.user_id.toString(),
          email: user?.email || '',
          full_name: user?.full_name || '',
          avatar_url: user?.avatar_url || '',
          role: member.role,
          status: member.status,
          time: member.updatedAt || member.createdAt || new Date(),
          permissions: allPermissions,
        };
      });

    const requestMembers = joinRequests
      .filter((request) => request.type === 'request')
      .map((request) => {
        const user = userMap.get(request.target_user_id.toString());
        return {
          user_id: request.target_user_id.toString(),
          request_id: request._id.toString(),
          email: user?.email || '',
          full_name: user?.full_name || '',
          avatar_url: user?.avatar_url || '',
          role: 'user',
          status: 'pending',
          time: request.createdAt || new Date(),
        };
      });

    const inviteMembers = joinRequests
      .filter((request) => request.type === 'invite')
      .map((request) => {
        const user = userMap.get(request.target_user_id.toString());
        return {
          user_id: request.target_user_id.toString(),
          request_id: request._id.toString(),
          email: user?.email || '',
          full_name: user?.full_name || '',
          avatar_url: user?.avatar_url || '',
          role: 'user',
          status: 'invited',
          time: request.createdAt || new Date(),
        };
      });

    let currentUserRole: 'owner' | 'admin' | 'member' | null = null;
    let currentUserPermissions: string[] = [];

    if (requestUserId) {
      if (workspace.owner_id.toString() === requestUserId) {
        currentUserRole = 'owner';

        currentUserPermissions = [
          'RENAME_WORKSPACE',
          'EDIT_DESCRIPTION',
          'MANAGE_PASSWORD',
          'MANAGE_MEMBERS',
          'ACCEPT_MEMBER',
          'MANAGE_PERMISSIONS',
        ];
      } else {
        const currentUserMember = members.find(
          (m) =>
            m.user_id.toString() === requestUserId && m.status === 'active',
        );
        if (currentUserMember) {
          currentUserRole =
            currentUserMember.role === 'admin' ? 'admin' : 'member';
          currentUserPermissions = currentUserMember.permissions || [];
        }
      }

      try {
        const workspacePermissions =
          await this.workspacePermissionService.getUserWorkspacePermissions(
            workspaceId,
            requestUserId,
          );

        const workspaceActionMap: { [key: string]: string } = {
          ROOM_ADMIN: 'room_admin',
          ROOM_USER: 'room_user',
        };

        let workspaceActions: string[] = [];
        if (workspacePermissions && workspacePermissions.actions) {
          workspaceActions = workspacePermissions.actions.map(
            (action) => workspaceActionMap[action] || action,
          );
        }

        currentUserPermissions = [
          ...new Set([...currentUserPermissions, ...workspaceActions]),
        ];
      } catch (error) {
        console.error('Failed to fetch workspace permissions:', error);
      }
    }

    return {
      name: workspace.name,
      description: workspace.description || '',
      invite_code: workspace.invite_code,
      hasPassword: !!workspace.password,
      permissions: currentUserPermissions,
      owner_id: workspace.owner_id.toString(),
      role: currentUserRole,
      members: {
        active: activeMembers,
        request: requestMembers,
        invite: inviteMembers,
        banned: bannedMembers,
      },
    };
  }

  async getMyWorkspaces(userId: string): Promise<{
    owner_workspace: any[];
    member_workspace: any[];
  }> {
    const memberships =
      await this.workspaceRepository.getWorkspacesByUser(userId);

    const owner_workspace: any[] = [];
    const member_workspace: any[] = [];

    memberships.forEach((membership) => {
      const workspaceData = {
        role: membership.role,
        status: membership.status,
        joined_at: membership.joined_at,
        locked: (membership.workspace_id as any)?.locked || false,
        workspace: membership.workspace_id,
      };

      // Check if user is owner of this workspace
      // workspace_id is populated, so we can access owner_id
      if ((membership.workspace_id as any)?.owner_id.toString() === userId) {
        owner_workspace.push(workspaceData);
      } else {
        member_workspace.push(workspaceData);
      }
    });

    return {
      owner_workspace,
      member_workspace,
    };
  }

  async searchWorkspaceByInviteCode(
    inviteCode: string,
    userId: string,
  ): Promise<WorkspaceSearchResponseDto> {
    const workspace =
      await this.workspaceRepository.getWorkspaceByInviteCode(inviteCode);

    if (!workspace) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    let userStatus:
      | 'none'
      | 'member'
      | 'pending_request'
      | 'pending_invitation'
      | 'banned'
      | 'owner' = 'none';

    if (workspace.owner_id.toString() === userId) {
      userStatus = 'owner';
    } else {
      const member = await this.workspaceRepository.getMember(
        workspace._id.toString(),
        userId,
      );

      if (member) {
        if (member.status === 'banned') {
          userStatus = 'banned';
        } else if (member.status === 'active') {
          userStatus = 'member';
        }
      } else {
        const joinRequest = await this.workspaceRepository.getJoinRequest(
          workspace._id.toString(),
          userId,
        );

        if (joinRequest) {
          if (joinRequest.type === 'request') {
            userStatus = 'pending_request';
          } else if (joinRequest.type === 'invite') {
            userStatus = 'pending_invitation';
          }
        }
      }
    }

    let ownerInfo: OwnerInfoDto = {
      user_id: workspace.owner_id.toString(),
      email: '',
      full_name: 'Unknown Owner',
    };

    try {
      const users = await this.userHttpClient.getUsersByIds([
        workspace.owner_id.toString(),
      ]);
      if (users && users.length > 0) {
        const owner = users[0];
        ownerInfo = {
          user_id: owner.user_id,
          email: owner.email || '',
          full_name: owner.full_name || 'Unknown Owner',
          avatar_url: owner.avatar_url,
        };
      }
    } catch (error) {
      console.log('Failed to fetch owner info:', error);
    }

    const workspaceInfo: WorkspaceSearchDto = {
      id: workspace._id.toString(),
      name: workspace.name,
      description: workspace.description,
      hasPassword: !!workspace.password,
      memberCount: workspace.member_count || 0,
      owner: ownerInfo,
      userStatus: userStatus,
    };

    return {
      workspace: workspaceInfo,
    };
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    if (updateWorkspaceDto.name !== undefined) {
      await this.permissionService.checkPermission(
        workspaceId,
        userId,
        Permission.RENAME_WORKSPACE,
      );
    }

    if (updateWorkspaceDto.description !== undefined) {
      await this.permissionService.checkPermission(
        workspaceId,
        userId,
        Permission.EDIT_DESCRIPTION,
      );
    }

    if (updateWorkspaceDto.password !== undefined) {
      await this.permissionService.checkPermission(
        workspaceId,
        userId,
        Permission.MANAGE_PASSWORD,
      );
    }

    return await this.workspaceRepository.updateWorkspace(
      workspaceId,
      updateWorkspaceDto,
    );
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);

    if (workspace.owner_id.toString() !== userId) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    await this.workspaceRepository.deleteWorkspace(workspaceId);
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return await this.workspaceRepository.getMembersByWorkspace(workspaceId);
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    targetUserId: string,
    role: string,
  ): Promise<WorkspaceMember> {
    await this.permissionService.checkManageMembersPermission(
      workspaceId,
      userId,
    );

    const member = await this.workspaceRepository.updateMemberRole(
      workspaceId,
      targetUserId,
      role,
    );

    this.workspaceGateway.emitRoleChanged(workspaceId, {
      targetUserId,
      newRole: role,
      changedBy: userId,
    });

    return member;
  }

  async updateMemberPermissions(
    workspaceId: string,
    userId: string,
    targetUserId: string,
    permissions: string[],
  ): Promise<WorkspaceMember> {
    await this.permissionService.checkManagePermissionsPermission(
      workspaceId,
      userId,
    );

    if (permissions.includes(Permission.MANAGE_PERMISSIONS)) {
      const workspace =
        await this.workspaceRepository.getWorkspaceById(workspaceId);
      if (workspace.owner_id.toString() !== userId) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }
    }

    const member = await this.workspaceRepository.updateMemberPermissions(
      workspaceId,
      targetUserId,
      permissions,
    );

    this.workspaceGateway.emitPermissionsChanged(workspaceId, {
      targetUserId,
      newPermissions: permissions,
      changedBy: userId,
    });

    return member;
  }

  async banMember(
    workspaceId: string,
    userId: string,
    targetUserId: string,
  ): Promise<WorkspaceMember> {
    await this.permissionService.checkManageMembersPermission(
      workspaceId,
      userId,
    );

    const member = await this.workspaceRepository.updateMemberStatus(
      workspaceId,
      targetUserId,
      'banned',
    );

    this.workspaceGateway.emitUserBanned(workspaceId, {
      targetUserId,
      bannedBy: userId,
    });

    return member;
  }

  async removeMember(
    workspaceId: string,
    userId: string,
    targetUserId: string,
  ): Promise<void> {
    if (userId !== targetUserId) {
      await this.permissionService.checkManageMembersPermission(
        workspaceId,
        userId,
      );
    }

    await this.workspaceRepository.removeMember(workspaceId, targetUserId);
    await this.workspaceRepository.decrementMemberCount(workspaceId);

    this.workspaceGateway.emitUserRemoved(workspaceId, {
      targetUserId,
      removedBy: userId,
    });
  }

  async requestJoinWorkspace(
    userId: string,
    joinWorkspaceDto: JoinWorkspaceDto,
  ): Promise<WorkspaceJoinRequest> {
    const workspace = await this.workspaceRepository.getWorkspaceByInviteCode(
      joinWorkspaceDto.invite_code,
    );

    const existingMember = await this.workspaceRepository.getMember(
      workspace._id.toString(),
      userId,
    );
    if (existingMember) {
      throw new AppException(ErrorCode.EMAIL_EXISTS);
    }

    const existingRequest = await this.workspaceRepository.getJoinRequest(
      workspace._id.toString(),
      userId,
    );
    if (existingRequest) {
      throw new AppException(ErrorCode.EMAIL_EXISTS);
    }

    return await this.workspaceRepository.createJoinRequest(
      workspace._id.toString(),
      userId,
      userId,
      'request',
      joinWorkspaceDto.message,
    );
  }

  async joinWorkspaceWithPassword(
    userId: string,
    joinDto: JoinWorkspaceWithPasswordDto,
  ): Promise<void> {
    const workspace = await this.workspaceRepository.getWorkspaceByInviteCode(
      joinDto.invite_code,
    );

    if (!workspace.password || workspace.password !== joinDto.password) {
      throw new AppException(ErrorCode.INVALID_PASSWORD);
    }

    const existingMember = await this.workspaceRepository.getMember(
      workspace._id.toString(),
      userId,
    );
    if (existingMember) {
      throw new AppException(ErrorCode.EMAIL_EXISTS);
    }

    await this.workspaceRepository.addMember(
      workspace._id.toString(),
      userId,
      'user',
    );

    await this.workspacePermissionService.createDefaultPermissions(
      workspace._id.toString(),
      userId,
      'user',
    );

    await this.workspaceRepository.updateWorkspace(workspace._id.toString(), {
      member_count: workspace.member_count + 1,
    });
  }

  async inviteUserToWorkspace(
    workspaceId: string,
    adminUserId: string,
    targetUserEmail: string,
    message?: string,
  ): Promise<WorkspaceJoinRequest> {
    await this.permissionService.checkAdminOrOwnerPermission(
      workspaceId,
      adminUserId,
    );

    const targetUser = await this.userHttpClient.getUser(targetUserEmail);
    if (!targetUser?.user_id) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    const existingMember = await this.workspaceRepository.getMember(
      workspaceId,
      targetUser.user_id,
    );
    if (existingMember) {
      throw new AppException(ErrorCode.EMAIL_EXISTS);
    }

    const existingRequest = await this.workspaceRepository.getJoinRequest(
      workspaceId,
      targetUser.user_id,
    );
    if (existingRequest) {
      throw new AppException(ErrorCode.EMAIL_EXISTS);
    }

    return await this.workspaceRepository.createJoinRequest(
      workspaceId,
      targetUser.user_id,
      adminUserId,
      'invite',
      message || 'You have been invited to join this workspace',
    );
  }

  async inviteMultipleUsersToWorkspace(
    workspaceId: string,
    adminUserId: string,
    userIds: string[],
    message?: string,
  ): Promise<{
    successful: Array<{ email: string; requestId: string }>;
    failed: Array<{ email: string; reason: string }>;
    summary: { total: number; successful: number; failed: number };
  }> {
    await this.permissionService.checkAdminOrOwnerPermission(
      workspaceId,
      adminUserId,
    );
    const successful: Array<{ email: string; requestId: string }> = [];
    const failed: Array<{ email: string; reason: string }> = [];

    for (const userId of userIds) {
      try {
        const targetUsers = await this.userHttpClient.getUsersByIds([userId]);
        const targetUser = targetUsers[0];
        if (!targetUser?.user_id) {
          failed.push({
            email: userId,
            reason: 'User not found',
          });
          continue;
        }

        const existingMember = await this.workspaceRepository.getMember(
          workspaceId,
          targetUser.user_id,
        );
        if (existingMember) {
          failed.push({
            email: targetUser.email || userId,
            reason: 'User is already a member',
          });
          continue;
        }

        const existingRequest = await this.workspaceRepository.getJoinRequest(
          workspaceId,
          targetUser.user_id,
        );
        if (existingRequest) {
          failed.push({
            email: targetUser.email || userId,
            reason: 'User already has a pending invitation or request',
          });
          continue;
        }

        const invitation = await this.workspaceRepository.createJoinRequest(
          workspaceId,
          targetUser.user_id,
          adminUserId,
          'invite',
          message || 'You have been invited to join this workspace',
        );

        successful.push({
          email: targetUser.email || userId,
          requestId: invitation._id.toString(),
        });
      } catch (error) {
        console.error(`Failed to invite user ${userId}:`, error);
        failed.push({
          email: userId,
          reason: 'Internal error occurred',
        });
      }
    }

    return {
      successful,
      failed,
      summary: {
        total: userIds.length,
        successful: successful.length,
        failed: failed.length,
      },
    };
  }

  async getWorkspaceJoinRequests(
    workspaceId: string,
    userId: string,
  ): Promise<JoinRequestResponseDto[]> {
    await this.permissionService.checkAcceptMemberPermission(
      workspaceId,
      userId,
    );

    const requests =
      await this.workspaceRepository.getJoinRequestsByWorkspace(workspaceId);

    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    const members =
      await this.workspaceRepository.getMembersByWorkspace(workspaceId);
    const memberCount = members.length;

    const owner = members.find((member) => member.role === 'admin');
    let ownerInfo: UserResponse | null = null;
    if (owner) {
      try {
        const userResponse = await this.userHttpClient.getUsersByIds([
          owner.user_id.toString(),
        ]);
        if (userResponse && userResponse.length > 0) {
          ownerInfo = userResponse[0];
        }
      } catch (error) {
        console.error('Error fetching owner info:', error);
      }
    }

    const requesterIds = requests.map((request) =>
      request.requester_id.toString(),
    );
    const uniqueRequesterIds = [...new Set(requesterIds)];

    let requestersInfo: UserResponse[] = [];
    if (uniqueRequesterIds.length > 0) {
      try {
        requestersInfo =
          await this.userHttpClient.getUsersByIds(uniqueRequesterIds);
      } catch (error) {
        console.error('Error fetching requesters info:', error);
      }
    }

    const result: JoinRequestResponseDto[] = requests.map((request) => {
      const requesterInfo = requestersInfo.find(
        (user) => user.user_id === request.requester_id.toString(),
      );

      const mapUserToDto = (user: UserResponse | null): UserInfoDto | null => {
        if (!user) return null;
        return {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
        };
      };

      const workspaceInfo: WorkspaceInfoDto = {
        id: workspace._id.toString(),
        name: workspace.name,
        description: workspace.description || '',
        hasPassword: !!workspace.password,
        memberCount: memberCount,
        owner: mapUserToDto(ownerInfo),
      };

      const joinRequestDto: JoinRequestResponseDto = {
        requestId: request._id.toString(),
        type: request.type,
        message: request.message,
        createdAt: request.createdAt || new Date(),
        workspace: workspaceInfo,
        requester: mapUserToDto(requesterInfo || null),
      };

      return joinRequestDto;
    });

    return result;
  }

  async getMyInvitations(userId: string): Promise<JoinRequestResponseDto[]> {
    console.log(
      'Fetching invitations for user:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa123333333333',
      userId,
    );

    const invitations =
      await this.workspaceRepository.getInvitationsByUser(userId);

    if (invitations.length === 0) {
      return [];
    }

    const validInvitations: WorkspaceJoinRequest[] = [];
    for (const invitation of invitations) {
      const member = await this.workspaceRepository.getMember(
        invitation.workspace_id.toString(),
        userId,
      );

      if (!member || member.status !== 'banned') {
        validInvitations.push(invitation);
      }
    }

    if (validInvitations.length === 0) {
      return [];
    }

    const workspaceIds = validInvitations.map((inv) =>
      inv.workspace_id.toString(),
    );
    const requesterIds = validInvitations.map((inv) =>
      inv.requester_id.toString(),
    );
    const uniqueWorkspaceIds = [...new Set(workspaceIds)];
    const uniqueRequesterIds = [...new Set(requesterIds)];

    const workspacesPromises = uniqueWorkspaceIds.map(async (id) => {
      try {
        return await this.workspaceRepository.getWorkspaceById(id);
      } catch (error) {
        console.error(`Error fetching workspace ${id}:`, error);
        return null;
      }
    });
    const workspaces = (await Promise.all(workspacesPromises)).filter(Boolean);

    const allMembersPromises = uniqueWorkspaceIds.map(async (id) => {
      try {
        return {
          workspaceId: id,
          members: await this.workspaceRepository.getMembersByWorkspace(id),
        };
      } catch (error) {
        console.error(`Error fetching members for workspace ${id}:`, error);
        return null;
      }
    });
    const allMembersResults = (await Promise.all(allMembersPromises)).filter(
      Boolean,
    );

    const ownerIds: string[] = [];
    allMembersResults.forEach((result) => {
      if (result) {
        const owner = result.members.find((member) => member.role === 'admin');
        if (owner) {
          ownerIds.push(owner.user_id.toString());
        }
      }
    });

    const allUserIds = [...new Set([...uniqueRequesterIds, ...ownerIds])];
    let usersInfo: UserResponse[] = [];
    if (allUserIds.length > 0) {
      try {
        usersInfo = await this.userHttpClient.getUsersByIds(allUserIds);
      } catch (error) {
        console.error('Error fetching users info:', error);
      }
    }

    const mapUserToDto = (user: UserResponse | null): UserInfoDto | null => {
      if (!user) return null;
      return {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      };
    };

    const result: JoinRequestResponseDto[] = validInvitations.map(
      (invitation) => {
        const workspace = workspaces.find(
          (ws) =>
            ws && ws._id.toString() === invitation.workspace_id.toString(),
        );
        if (!workspace) {
          throw new AppException(ErrorCode.NOT_FOUND);
        }

        const workspaceMembersResult = allMembersResults.find(
          (result) => result && result.workspaceId === workspace._id.toString(),
        );
        const workspaceMembers = workspaceMembersResult?.members || [];

        const owner = workspaceMembers.find(
          (member) => member.role === 'admin',
        );
        const ownerInfo = usersInfo.find(
          (user) => user.user_id === owner?.user_id.toString(),
        );

        const requesterInfo = usersInfo.find(
          (user) => user.user_id === invitation.requester_id.toString(),
        );

        const memberCount = workspaceMembers.length;

        const workspaceInfo: WorkspaceInfoDto = {
          id: workspace._id.toString(),
          name: workspace.name,
          description: workspace.description || '',
          hasPassword: !!workspace.password,
          memberCount: memberCount,
          owner: mapUserToDto(ownerInfo || null),
        };

        const joinRequestDto: JoinRequestResponseDto = {
          requestId: invitation._id.toString(),
          type: invitation.type,
          message: invitation.message,
          createdAt: invitation.createdAt || new Date(),
          workspace: workspaceInfo,
          requester: mapUserToDto(requesterInfo || null),
        };

        return joinRequestDto;
      },
    );

    return result;
  }

  async getMyRequests(userId: string): Promise<JoinRequestResponseDto[]> {
    const requests = await this.workspaceRepository.getRequestsByUser(userId);

    if (requests.length === 0) {
      return [];
    }

    const workspaceIds = requests.map((req) => req.workspace_id.toString());
    const uniqueWorkspaceIds = [...new Set(workspaceIds)];

    const workspacesPromises = uniqueWorkspaceIds.map(async (id: string) => {
      try {
        return await this.workspaceRepository.getWorkspaceById(id);
      } catch (error) {
        console.error(`Error fetching workspace ${id}:`, error);
        return null;
      }
    });
    const workspaces = (await Promise.all(workspacesPromises)).filter(Boolean);

    const allMembersPromises = uniqueWorkspaceIds.map(async (id: string) => {
      try {
        return {
          workspaceId: id,
          members: await this.workspaceRepository.getMembersByWorkspace(id),
        };
      } catch (error) {
        console.error(`Error fetching members for workspace ${id}:`, error);
        return null;
      }
    });
    const allMembersResults = (await Promise.all(allMembersPromises)).filter(
      Boolean,
    );

    const ownerIds: string[] = [];
    allMembersResults.forEach((result) => {
      if (result) {
        const owner = result.members.find((member) => member.role === 'admin');
        if (owner) {
          ownerIds.push(owner.user_id.toString());
        }
      }
    });

    const allUserIds = [...new Set([userId, ...ownerIds])];
    let usersInfo: UserResponse[] = [];
    if (allUserIds.length > 0) {
      try {
        usersInfo = await this.userHttpClient.getUsersByIds(allUserIds);
      } catch (error) {
        console.error('Error fetching users info:', error);
      }
    }

    const mapUserToDto = (user: UserResponse | null): UserInfoDto | null => {
      if (!user) return null;
      return {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      };
    };

    const result: JoinRequestResponseDto[] = requests.map((request) => {
      const workspace = workspaces.find(
        (ws) => ws && ws._id.toString() === request.workspace_id.toString(),
      );
      if (!workspace) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      const workspaceMembersResult = allMembersResults.find(
        (result) => result && result.workspaceId === workspace._id.toString(),
      );
      const workspaceMembers = workspaceMembersResult?.members || [];

      const owner = workspaceMembers.find((member) => member.role === 'admin');
      const ownerInfo = usersInfo.find(
        (user) => user.user_id === owner?.user_id.toString(),
      );

      const requesterInfo = usersInfo.find(
        (user) => user.user_id === request.requester_id.toString(),
      );

      const memberCount = workspaceMembers.length;

      const workspaceInfo: WorkspaceInfoDto = {
        id: workspace._id.toString(),
        name: workspace.name,
        description: workspace.description || '',
        hasPassword: !!workspace.password,
        memberCount: memberCount,
        owner: mapUserToDto(ownerInfo || null),
      };

      const joinRequestDto: JoinRequestResponseDto = {
        requestId: request._id.toString(),
        type: request.type,
        message: request.message,
        createdAt: request.createdAt || new Date(),
        workspace: workspaceInfo,
        requester: mapUserToDto(requesterInfo || null),
      };

      return joinRequestDto;
    });

    return result;
  }

  async approveJoinRequest(
    workspaceId: string,
    userId: string,
    targetUserId: string,
  ): Promise<void> {
    console.log('Approving join request:', {
      workspaceId,
      userId,
      targetUserId,
    });
    await this.permissionService.checkAcceptMemberPermission(
      workspaceId,
      userId,
    );

    const request =
      await this.workspaceRepository.getJoinRequestByUserAndWorkspace(
        workspaceId,
        targetUserId,
        'request',
      );

    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    await this.workspaceRepository.addMember(workspaceId, targetUserId, 'user');
    await this.workspaceRepository.incrementMemberCount(workspaceId);

    await this.permissionService.createDefaultPermissions(
      workspaceId,
      targetUserId,
      'user',
    );

    await this.workspaceRepository.deleteJoinRequest(request._id.toString());
  }

  async rejectJoinRequest(
    workspaceId: string,
    userId: string,
    targetUserId: string,
  ): Promise<void> {
    await this.permissionService.checkAcceptMemberPermission(
      workspaceId,
      userId,
    );

    const request =
      await this.workspaceRepository.getJoinRequestByUserAndWorkspace(
        workspaceId,
        targetUserId,
        'request',
      );

    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    await this.workspaceRepository.deleteJoinRequest(request._id.toString());
  }

  async cancelJoinRequest(userId: string, requestId: string): Promise<void> {
    const request =
      await this.workspaceRepository.getJoinRequestById(requestId);

    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    if (request.requester_id.toString() !== userId) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    await this.workspaceRepository.deleteJoinRequest(requestId);
  }

  async acceptInvitation(userId: string, requestId: string): Promise<void> {
    const request =
      await this.workspaceRepository.getJoinRequestById(requestId);

    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    if (
      request.target_user_id.toString() !== userId ||
      request.type !== 'invite'
    ) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    await this.workspaceRepository.addMember(
      request.workspace_id.toString(),
      userId,
      'user',
    );
    await this.workspaceRepository.incrementMemberCount(
      request.workspace_id.toString(),
    );

    await this.permissionService.createDefaultPermissions(
      request.workspace_id.toString(),
      userId,
      'user',
    );

    await this.workspaceRepository.deleteJoinRequest(requestId);
  }

  async rejectInvitation(userId: string, requestId: string): Promise<void> {
    const request =
      await this.workspaceRepository.getJoinRequestById(requestId);

    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    if (request.type !== 'invite') {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    const isTargetUser = request.target_user_id.toString() === userId;
    let hasAcceptPermission = false;

    if (!isTargetUser) {
      try {
        await this.permissionService.checkAcceptMemberPermission(
          request.workspace_id.toString(),
          userId,
        );
        hasAcceptPermission = true;
      } catch (error) {
        hasAcceptPermission = false;
      }
    }

    if (!isTargetUser && !hasAcceptPermission) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    await this.workspaceRepository.deleteJoinRequest(requestId);
  }

  private async checkUserRole(
    workspaceId: string,
    userId: string,
    requiredRole: string,
  ): Promise<void> {
    const member = await this.workspaceRepository.getMember(
      workspaceId,
      userId,
    );

    if (!member) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    if (requiredRole === 'admin' && member.role !== 'admin') {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    if (member.status === 'banned') {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }
  }

  /**
   * Ban user by requestId or userId
   * If requestId provided: find user from join request and ban them
   * If userId provided: check if user is member/has requests and ban them
   */
  async banUser(
    workspaceId: string,
    adminUserId: string,
    requestId?: string,
    targetUserId?: string,
  ): Promise<void> {
    await this.permissionService.checkManageMembersPermission(
      workspaceId,
      adminUserId,
    );

    let userToBan: string;

    if (requestId) {
      const joinRequest =
        await this.workspaceRepository.getJoinRequestById(requestId);
      if (!joinRequest) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      if (joinRequest.workspace_id.toString() !== workspaceId) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      userToBan = joinRequest.target_user_id.toString();

      await this.workspaceRepository.deleteJoinRequest(requestId);
    } else if (targetUserId) {
      userToBan = targetUserId;

      const userRequest =
        await this.workspaceRepository.getJoinRequestByUserAndWorkspace(
          workspaceId,
          userToBan,
          'request',
        );

      if (userRequest) {
        await this.workspaceRepository.deleteJoinRequest(
          userRequest._id.toString(),
        );
      }

      const userInvitation =
        await this.workspaceRepository.getJoinRequestByUserAndWorkspace(
          workspaceId,
          userToBan,
          'invite',
        );

      if (userInvitation) {
        await this.workspaceRepository.deleteJoinRequest(
          userInvitation._id.toString(),
        );
      }
    } else {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    const existingMember = await this.workspaceRepository.getMember(
      workspaceId,
      userToBan,
    );

    if (existingMember) {
      await this.workspaceRepository.updateMemberStatus(
        workspaceId,
        userToBan,
        'banned',
      );
    } else {
      await this.workspaceRepository.addMember(workspaceId, userToBan);

      await this.workspaceRepository.updateMemberStatus(
        workspaceId,
        userToBan,
        'banned',
      );
    }

    this.workspaceGateway.emitUserBanned(workspaceId, {
      targetUserId: userToBan,
      bannedBy: adminUserId,
    });
  }

  /**
   * Unban user with two options:
   * - remove: Delete user completely from workspace
   * - unban: Change status from banned to active
   */
  async unbanUser(
    workspaceId: string,
    adminUserId: string,
    targetUserId: string,
    action: 'remove' | 'unban',
  ): Promise<void> {
    await this.permissionService.checkManageMembersPermission(
      workspaceId,
      adminUserId,
    );

    const existingMember = await this.workspaceRepository.getMember(
      workspaceId,
      targetUserId,
    );

    if (!existingMember) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    if (existingMember.status !== 'banned') {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    if (action === 'remove') {
      await this.workspaceRepository.removeMember(workspaceId, targetUserId);
    } else if (action === 'unban') {
      await this.workspaceRepository.updateMemberStatus(
        workspaceId,
        targetUserId,
        'active',
      );

      await this.workspaceRepository.incrementMemberCount(workspaceId);
    }
  }

  /**
   * Advanced permission management - grant, revoke, or set permissions
   * Only owner or users with MANAGE_PERMISSIONS can manage permissions
   * Only owner can grant MANAGE_PERMISSIONS to others
   */
  async manageMemberPermissions(
    workspaceId: string,
    userId: string,
    targetUserId: string,
    permissions: Permission[],
    action: 'grant' | 'revoke' | 'set' = 'set',
  ): Promise<WorkspaceMember> {
    await this.permissionService.checkManagePermissionsPermission(
      workspaceId,
      userId,
    );

    if (
      permissions.includes(Permission.MANAGE_PERMISSIONS) &&
      action !== 'revoke'
    ) {
      const workspace =
        await this.workspaceRepository.getWorkspaceById(workspaceId);
      if (workspace.owner_id.toString() !== userId) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }
    }

    const roomPermissions: string[] = [];
    const memberPermissions: Permission[] = [];

    permissions.forEach((permission) => {
      if (
        permission === 'room_permission' ||
        permission === 'room_admin' ||
        permission === 'room_user'
      ) {
        roomPermissions.push(permission);
      } else {
        memberPermissions.push(permission);
      }
    });

    for (const roomPermission of roomPermissions) {
      if (roomPermission === 'room_permission') {
        const currentPermission =
          await this.workspacePermissionService.getUserPermissions(
            workspaceId,
            targetUserId,
          );

        const currentActions = currentPermission?.actions || ['ROOM_USER'];
        const hasRoomAdmin = currentActions.includes('ROOM_ADMIN');

        if (action === 'grant' || action === 'set') {
          if (hasRoomAdmin) {
            await this.workspacePermissionService.updatePermissions(
              workspaceId,
              targetUserId,
              ['ROOM_USER'],
            );
          } else {
            await this.workspacePermissionService.updatePermissions(
              workspaceId,
              targetUserId,
              ['ROOM_ADMIN'],
            );
          }
        } else if (action === 'revoke') {
          await this.workspacePermissionService.updatePermissions(
            workspaceId,
            targetUserId,
            ['ROOM_USER'],
          );
        }
      } else if (roomPermission === 'room_admin') {
        // Set user as ROOM_ADMIN
        await this.workspacePermissionService.updatePermissions(
          workspaceId,
          targetUserId,
          ['ROOM_ADMIN'],
        );
      } else if (roomPermission === 'room_user') {
        // Set user as ROOM_USER
        await this.workspacePermissionService.updatePermissions(
          workspaceId,
          targetUserId,
          ['ROOM_USER'],
        );
      }
    }

    if (memberPermissions.length > 0) {
      const member = await this.workspaceRepository.getMember(
        workspaceId,
        targetUserId,
      );
      if (!member) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      let newPermissions: string[];

      switch (action) {
        case 'grant':
          newPermissions = [
            ...new Set([...member.permissions, ...memberPermissions]),
          ];
          break;
        case 'revoke':
          newPermissions = member.permissions.filter(
            (p) => !memberPermissions.includes(p as Permission),
          );
          break;
        case 'set':
        default:
          newPermissions = memberPermissions;
          break;
      }

      const updatedMember =
        await this.workspaceRepository.updateMemberPermissions(
          workspaceId,
          targetUserId,
          newPermissions,
        );
      return updatedMember;
    }

    const member = await this.workspaceRepository.getMember(
      workspaceId,
      targetUserId,
    );
    if (!member) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    return member;
  }

  /**
   * Remove member completely from workspace (not ban, just remove)
   * Only owner or users with MANAGE_MEMBERS permission can remove members
   */
  async removeMemberFromWorkspace(
    workspaceId: string,
    adminUserId: string,
    targetUserId: string,
  ): Promise<void> {
    await this.permissionService.checkManageMembersPermission(
      workspaceId,
      adminUserId,
    );

    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);
    if (workspace.owner_id.toString() === targetUserId) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    const member = await this.workspaceRepository.getMember(
      workspaceId,
      targetUserId,
    );
    if (!member) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    await this.workspaceRepository.removeMember(workspaceId, targetUserId);

    if (member.status === 'active') {
      await this.workspaceRepository.decrementMemberCount(workspaceId);
    }

    this.workspaceGateway.emitUserRemoved(workspaceId, {
      targetUserId,
      removedBy: adminUserId,
    });
  }

  async getWorkspaceBasicInfo(
    workspaceId: string,
    userId: string,
  ): Promise<Workspace> {
    const hasAccess = await this.verifyUserAccess(workspaceId, userId);
    if (!hasAccess) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    return await this.workspaceRepository.getWorkspaceById(workspaceId);
  }

  async verifyUserAccess(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const workspace =
        await this.workspaceRepository.getWorkspaceById(workspaceId);
      if (!workspace) {
        return false;
      }
      if (workspace.locked) {
        return false;
      }

      const member = await this.workspaceRepository.getMember(
        workspaceId,
        userId,
      );

      return member !== null && member.status === 'active';
    } catch (error) {
      console.error('Error verifying workspace access:', error);
      return false;
    }
  }

  /**
   * Lock all workspaces of a user except the first one created
   * Returns info about locked workspaces and preserved first workspace
   */
  async lockUserWorkspacesExceptFirst(userId: string): Promise<{
    total: number;
    locked: number;
    preserved: { workspaceId: string; workspaceName: string };
  }> {
    try {
      // Get all workspaces owned by the user, sorted by creation date
      const workspaces =
        await this.workspaceRepository.getWorkspacesByOwner(userId);

      if (workspaces.length === 0) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      // Sort by createdAt to find the first workspace
      const sortedWorkspaces = workspaces.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      });

      const firstWorkspace = sortedWorkspaces[0];
      const workspacesToLock = sortedWorkspaces.slice(1);

      // Lock all workspaces except the first one
      let lockedCount = 0;
      for (const workspace of workspacesToLock) {
        await this.workspaceRepository.updateWorkspace(
          workspace._id.toString(),
          { locked: true },
        );
        lockedCount++;
      }

      console.log(
        `Locked ${lockedCount} workspaces for user ${userId}, preserved: ${firstWorkspace._id}`,
      );

      return {
        total: workspaces.length,
        locked: lockedCount,
        preserved: {
          workspaceId: firstWorkspace._id.toString(),
          workspaceName: firstWorkspace.name,
        },
      };
    } catch (error) {
      console.error(`Failed to lock workspaces for user ${userId}:`, error);
      throw error;
    }
  }
}
