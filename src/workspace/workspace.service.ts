import { Injectable, Inject } from '@nestjs/common';
import { WorkspaceRepository } from './workspace.repository';
import { PermissionService, Permission } from './permission.service';
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

// Define interface for user data from HTTP client
interface UserResponse {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly permissionService: PermissionService,
    private readonly userHttpClient: UserHttpClient,
    private readonly workspaceGateway: WorkspaceWebSocketGateway,
  ) {}

  // ========== Workspace Methods ==========
  async createWorkspace(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.createWorkspace(
      userId,
      createWorkspaceDto.name,
      createWorkspaceDto.description || '',
      createWorkspaceDto.password,
    );

    // Add owner as admin member
    await this.workspaceRepository.addMember(
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
          // Ignore errors for initial invitations to be resilient
          console.error('Failed to create initial invitations:', e);
        }
      }
    }

    return workspace;
  }

  async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    return await this.workspaceRepository.getWorkspaceById(workspaceId);
  }

  async getWorkspaceDetail(
    workspaceId: string,
    requestUserId?: string,
  ): Promise<WorkspaceDetailDto> {
    // Get workspace info
    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);
    console.log('Workspace info:', workspace);
    // Get all members and join requests
    const [members, joinRequests] = await Promise.all([
      this.workspaceRepository.getMembersByWorkspace(workspaceId),
      this.workspaceRepository.getJoinRequestsByWorkspace(workspaceId),
    ]);

    // Collect all user IDs
    const memberUserIds = members.map((m) => m.user_id.toString());
    const requestUserIds = joinRequests.map((r) => r.target_user_id.toString());
    const allUserIds = [...memberUserIds, ...requestUserIds];

    // Get user details from core service
    let users: any[] = [];
    if (allUserIds.length > 0) {
      try {
        users = await this.userHttpClient.getUsersByIds(allUserIds);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        // Continue with empty users array if service fails
      }
    }

    // Create user lookup map
    const userMap = new Map<string, any>();
    users.forEach((user) => {
      userMap.set(user.user_id, user);
    });

    // Separate members by status
    const activeMembers = members
      .filter((m) => m.status === 'active')
      .map((member) => {
        const user = userMap.get(member.user_id.toString());
        return {
          user_id: member.user_id.toString(),
          email: user?.email || '',
          full_name: user?.full_name || '',
          avatar_url: user?.avatar_url || '',
          role: member.role,
          status: member.status,
          time: member.joined_at,
          permissions: member.permissions || [], // Include member permissions
        };
      });

    const bannedMembers = members
      .filter((m) => m.status === 'banned')
      .map((member) => {
        const user = userMap.get(member.user_id.toString());
        return {
          user_id: member.user_id.toString(),
          email: user?.email || '',
          full_name: user?.full_name || '',
          avatar_url: user?.avatar_url || '',
          role: member.role,
          status: member.status,
          time: member.updatedAt || member.createdAt || new Date(),
          permissions: member.permissions || [], // Include member permissions
        };
      });

    // Map join requests - separate by type
    const requestMembers = joinRequests
      .filter((request) => request.type === 'request')
      .map((request) => {
        const user = userMap.get(request.target_user_id.toString());
        return {
          user_id: request.target_user_id.toString(),
          request_id: request._id.toString(), // Add request_id for request management
          email: user?.email || '',
          full_name: user?.full_name || '',
          avatar_url: user?.avatar_url || '',
          role: 'user', // Default role for requests
          status: 'pending', // All join requests are pending
          time: request.createdAt || new Date(),
        };
      });

    const inviteMembers = joinRequests
      .filter((request) => request.type === 'invite')
      .map((request) => {
        const user = userMap.get(request.target_user_id.toString());
        return {
          user_id: request.target_user_id.toString(),
          request_id: request._id.toString(), // Add request_id for invitation cancellation
          email: user?.email || '',
          full_name: user?.full_name || '',
          avatar_url: user?.avatar_url || '',
          role: 'user', // Default role for invites
          status: 'invited', // All invites are invited status
          time: request.createdAt || new Date(),
        };
      });

    // Determine current user's role and permissions
    let currentUserRole: 'owner' | 'admin' | 'member' | null = null;
    let currentUserPermissions: string[] = [];

    if (requestUserId) {
      // Check if user is owner
      if (workspace.owner_id.toString() === requestUserId) {
        currentUserRole = 'owner';
        // Owner has all permissions
        currentUserPermissions = [
          'RENAME_WORKSPACE',
          'EDIT_DESCRIPTION',
          'MANAGE_PASSWORD',
          'MANAGE_MEMBERS',
          'ACCEPT_MEMBER',
          'MANAGE_PERMISSIONS',
        ];
      } else {
        // Check if user is a member and get their role
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
    }

    return {
      name: workspace.name,
      description: workspace.description || '',
      invite_code: workspace.invite_code,
      hasPassword: !!workspace.password,
      permissions: currentUserPermissions, // Add current user's permissions
      owner_id: workspace.owner_id.toString(), // Add owner_id for frontend
      role: currentUserRole,
      members: {
        active: activeMembers,
        request: requestMembers,
        invite: inviteMembers,
        banned: bannedMembers,
      },
    };
  }

  async getMyWorkspaces(userId: string): Promise<any[]> {
    const memberships =
      await this.workspaceRepository.getWorkspacesByUser(userId);
    return memberships.map((membership) => ({
      role: membership.role,
      status: membership.status,
      joined_at: membership.joined_at,
      workspace: membership.workspace_id,
    }));
  }

  async searchWorkspaceByInviteCode(
    inviteCode: string,
    userId: string,
  ): Promise<WorkspaceSearchResponseDto> {
    // Find workspace by invite code
    const workspace =
      await this.workspaceRepository.getWorkspaceByInviteCode(inviteCode);

    if (!workspace) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Check user status in relation to this workspace
    let userStatus:
      | 'none'
      | 'member'
      | 'pending_request'
      | 'pending_invitation'
      | 'banned'
      | 'owner' = 'none';

    // Check if user is owner
    if (workspace.owner_id.toString() === userId) {
      userStatus = 'owner';
    } else {
      // Check if user is already a member
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
        // Check for pending requests or invitations only if not banned
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

    // Get owner information
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
      // Continue with default owner info
    }

    // Build response
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
    // Check specific permissions based on what's being updated
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

    // Only owner can delete
    if (workspace.owner_id.toString() !== userId) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    await this.workspaceRepository.deleteWorkspace(workspaceId);
  }

  // ========== Member Management ==========
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return await this.workspaceRepository.getMembersByWorkspace(workspaceId);
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    targetUserId: string,
    role: string,
  ): Promise<WorkspaceMember> {
    // Check if requester has MANAGE_MEMBERS permission
    await this.permissionService.checkManageMembersPermission(
      workspaceId,
      userId,
    );

    const member = await this.workspaceRepository.updateMemberRole(
      workspaceId,
      targetUserId,
      role,
    );

    // Emit WebSocket event for role change
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
    // Check if requester has MANAGE_PERMISSIONS permission
    // This will allow only owner or users with MANAGE_PERMISSIONS to manage permissions
    await this.permissionService.checkManagePermissionsPermission(
      workspaceId,
      userId,
    );

    // Additional check: if trying to grant MANAGE_PERMISSIONS, only owner can do it
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

    // Emit WebSocket event for permission change
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
    // Check if requester has MANAGE_MEMBERS permission
    await this.permissionService.checkManageMembersPermission(
      workspaceId,
      userId,
    );

    const member = await this.workspaceRepository.updateMemberStatus(
      workspaceId,
      targetUserId,
      'banned',
    );

    // Emit WebSocket event for ban
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
    // Check if requester has MANAGE_MEMBERS permission or removing themselves
    if (userId !== targetUserId) {
      await this.permissionService.checkManageMembersPermission(
        workspaceId,
        userId,
      );
    }

    await this.workspaceRepository.removeMember(workspaceId, targetUserId);
    await this.workspaceRepository.decrementMemberCount(workspaceId);

    // Emit WebSocket event for removal
    this.workspaceGateway.emitUserRemoved(workspaceId, {
      targetUserId,
      removedBy: userId,
    });
  }

  // ========== Join Request Methods ==========
  async requestJoinWorkspace(
    userId: string,
    joinWorkspaceDto: JoinWorkspaceDto,
  ): Promise<WorkspaceJoinRequest> {
    const workspace = await this.workspaceRepository.getWorkspaceByInviteCode(
      joinWorkspaceDto.invite_code,
    );

    // Check if already a member
    const existingMember = await this.workspaceRepository.getMember(
      workspace._id.toString(),
      userId,
    );
    if (existingMember) {
      throw new AppException(ErrorCode.EMAIL_EXISTS); // Reuse existing error code
    }

    // Check if already has a pending request
    const existingRequest = await this.workspaceRepository.getJoinRequest(
      workspace._id.toString(),
      userId,
    );
    if (existingRequest) {
      throw new AppException(ErrorCode.EMAIL_EXISTS); // Reuse existing error code
    }

    return await this.workspaceRepository.createJoinRequest(
      workspace._id.toString(),
      userId, // target_user_id (người muốn join)
      userId, // requester_id (cũng là người đó)
      'request', // type
      joinWorkspaceDto.message,
    );
  }

  async joinWorkspaceWithPassword(
    userId: string,
    joinDto: JoinWorkspaceWithPasswordDto,
  ): Promise<void> {
    // Find workspace by invite code
    const workspace = await this.workspaceRepository.getWorkspaceByInviteCode(
      joinDto.invite_code,
    );

    // Check password
    if (!workspace.password || workspace.password !== joinDto.password) {
      throw new AppException(ErrorCode.INVALID_PASSWORD);
    }

    // Check if already a member
    const existingMember = await this.workspaceRepository.getMember(
      workspace._id.toString(),
      userId,
    );
    if (existingMember) {
      throw new AppException(ErrorCode.EMAIL_EXISTS); // Already a member
    }

    // Add user as member directly
    await this.workspaceRepository.addMember(
      workspace._id.toString(),
      userId,
      'user', // Default role
    );

    // Update member count
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
    // Check if requester is admin or owner (no specific permission required)
    await this.permissionService.checkAdminOrOwnerPermission(
      workspaceId,
      adminUserId,
    );

    // Get target user info by email
    const targetUser = await this.userHttpClient.getUser(targetUserEmail);
    if (!targetUser?.user_id) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // Check if already a member
    const existingMember = await this.workspaceRepository.getMember(
      workspaceId,
      targetUser.user_id,
    );
    if (existingMember) {
      throw new AppException(ErrorCode.EMAIL_EXISTS);
    }

    // Check if already has a pending invite/request
    const existingRequest = await this.workspaceRepository.getJoinRequest(
      workspaceId,
      targetUser.user_id,
    );
    if (existingRequest) {
      throw new AppException(ErrorCode.EMAIL_EXISTS);
    }

    return await this.workspaceRepository.createJoinRequest(
      workspaceId,
      targetUser.user_id, // target_user_id
      adminUserId, // requester_id (admin)
      'invite', // type
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
    // Check if requester is admin or owner (no specific permission required)
    await this.permissionService.checkAdminOrOwnerPermission(
      workspaceId,
      adminUserId,
    );
    const successful: Array<{ email: string; requestId: string }> = [];
    const failed: Array<{ email: string; reason: string }> = [];

    // Process each userId
    for (const userId of userIds) {
      try {
        // Get target user info by userId
        const targetUsers = await this.userHttpClient.getUsersByIds([userId]);
        const targetUser = targetUsers[0];
        if (!targetUser?.user_id) {
          failed.push({
            email: userId, // Keep using email field for consistency with frontend
            reason: 'User not found',
          });
          continue;
        }

        // Check if already a member
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

        // Check if already has a pending invite/request
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

        // Create invitation
        const invitation = await this.workspaceRepository.createJoinRequest(
          workspaceId,
          targetUser.user_id, // target_user_id
          adminUserId, // requester_id (admin)
          'invite', // type
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
    // Check if user has ACCEPT_MEMBER permission
    await this.permissionService.checkAcceptMemberPermission(
      workspaceId,
      userId,
    );

    // Get all join requests for this workspace
    const requests =
      await this.workspaceRepository.getJoinRequestsByWorkspace(workspaceId);

    // Get workspace info
    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Get all members to count
    const members =
      await this.workspaceRepository.getMembersByWorkspace(workspaceId);
    const memberCount = members.length;

    // Get workspace owner info from members
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

    // Get all requester IDs
    const requesterIds = requests.map((request) =>
      request.requester_id.toString(),
    );
    const uniqueRequesterIds = [...new Set(requesterIds)];

    // Get all requester info in one call
    let requestersInfo: UserResponse[] = [];
    if (uniqueRequesterIds.length > 0) {
      try {
        requestersInfo =
          await this.userHttpClient.getUsersByIds(uniqueRequesterIds);
      } catch (error) {
        console.error('Error fetching requesters info:', error);
      }
    }

    // Transform requests to include all required info
    const result: JoinRequestResponseDto[] = requests.map((request) => {
      const requesterInfo = requestersInfo.find(
        (user) => user.user_id === request.requester_id.toString(),
      );

      // Map UserResponse to UserInfoDto
      const mapUserToDto = (user: UserResponse | null): UserInfoDto | null => {
        if (!user) return null;
        return {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
        };
      };

      // Create workspace info DTO
      const workspaceInfo: WorkspaceInfoDto = {
        id: workspace._id.toString(),
        name: workspace.name,
        description: workspace.description || '',
        hasPassword: !!workspace.password,
        memberCount: memberCount,
        owner: mapUserToDto(ownerInfo),
      };

      // Create join request response DTO
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
    // Get all invitations where user is the target
    const invitations =
      await this.workspaceRepository.getInvitationsByUser(userId);

    if (invitations.length === 0) {
      return [];
    }

    // Filter out invitations from workspaces where user is banned
    const validInvitations: WorkspaceJoinRequest[] = [];
    for (const invitation of invitations) {
      // Check if user is banned from this workspace
      const member = await this.workspaceRepository.getMember(
        invitation.workspace_id.toString(),
        userId,
      );
      
      // If user is not a member or not banned, include the invitation
      if (!member || member.status !== 'banned') {
        validInvitations.push(invitation);
      }
    }

    if (validInvitations.length === 0) {
      return [];
    }

    // Get all workspace IDs and requester IDs from valid invitations
    const workspaceIds = validInvitations.map((inv) => inv.workspace_id.toString());
    const requesterIds = validInvitations.map((inv) => inv.requester_id.toString());
    const uniqueWorkspaceIds = [...new Set(workspaceIds)];
    const uniqueRequesterIds = [...new Set(requesterIds)];

    // Get all workspace info
    const workspacesPromises = uniqueWorkspaceIds.map(async (id) => {
      try {
        return await this.workspaceRepository.getWorkspaceById(id);
      } catch (error) {
        console.error(`Error fetching workspace ${id}:`, error);
        return null;
      }
    });
    const workspaces = (await Promise.all(workspacesPromises)).filter(Boolean);

    // Get all workspace members to find owners and count
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

    // Get all owner IDs
    const ownerIds: string[] = [];
    allMembersResults.forEach((result) => {
      if (result) {
        const owner = result.members.find((member) => member.role === 'admin');
        if (owner) {
          ownerIds.push(owner.user_id.toString());
        }
      }
    });

    // Get all user info in batch calls
    const allUserIds = [...new Set([...uniqueRequesterIds, ...ownerIds])];
    let usersInfo: UserResponse[] = [];
    if (allUserIds.length > 0) {
      try {
        usersInfo = await this.userHttpClient.getUsersByIds(allUserIds);
      } catch (error) {
        console.error('Error fetching users info:', error);
      }
    }

    // Map UserResponse to UserInfoDto
    const mapUserToDto = (user: UserResponse | null): UserInfoDto | null => {
      if (!user) return null;
      return {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      };
    };

    // Transform invitations to DTOs
    const result: JoinRequestResponseDto[] = validInvitations.map((invitation) => {
      // Find corresponding workspace
      const workspace = workspaces.find(
        (ws) => ws && ws._id.toString() === invitation.workspace_id.toString(),
      );
      if (!workspace) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      // Find workspace members
      const workspaceMembersResult = allMembersResults.find(
        (result) => result && result.workspaceId === workspace._id.toString(),
      );
      const workspaceMembers = workspaceMembersResult?.members || [];

      // Find owner
      const owner = workspaceMembers.find((member) => member.role === 'admin');
      const ownerInfo = usersInfo.find(
        (user) => user.user_id === owner?.user_id.toString(),
      );

      // Find requester info
      const requesterInfo = usersInfo.find(
        (user) => user.user_id === invitation.requester_id.toString(),
      );

      // Get member count
      const memberCount = workspaceMembers.length;

      // Create workspace info DTO
      const workspaceInfo: WorkspaceInfoDto = {
        id: workspace._id.toString(),
        name: workspace.name,
        description: workspace.description || '',
        hasPassword: !!workspace.password,
        memberCount: memberCount,
        owner: mapUserToDto(ownerInfo || null),
      };

      // Create join request response DTO
      const joinRequestDto: JoinRequestResponseDto = {
        requestId: invitation._id.toString(),
        type: invitation.type,
        message: invitation.message,
        createdAt: invitation.createdAt || new Date(),
        workspace: workspaceInfo,
        requester: mapUserToDto(requesterInfo || null),
      };

      return joinRequestDto;
    });

    return result;
  }

  async getMyRequests(userId: string): Promise<JoinRequestResponseDto[]> {
    // Get all requests where user is the requester (they sent join requests)
    const requests = await this.workspaceRepository.getRequestsByUser(userId);

    if (requests.length === 0) {
      return [];
    }

    // Get all workspace IDs
    const workspaceIds = requests.map((req) => req.workspace_id.toString());
    const uniqueWorkspaceIds = [...new Set(workspaceIds)];

    // Get all workspace info
    const workspacesPromises = uniqueWorkspaceIds.map(async (id: string) => {
      try {
        return await this.workspaceRepository.getWorkspaceById(id);
      } catch (error) {
        console.error(`Error fetching workspace ${id}:`, error);
        return null;
      }
    });
    const workspaces = (await Promise.all(workspacesPromises)).filter(Boolean);

    // Get all workspace members to find owners and count
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

    // Get all owner IDs
    const ownerIds: string[] = [];
    allMembersResults.forEach((result) => {
      if (result) {
        const owner = result.members.find((member) => member.role === 'admin');
        if (owner) {
          ownerIds.push(owner.user_id.toString());
        }
      }
    });

    // Get user info (including user themselves as requester)
    const allUserIds = [...new Set([userId, ...ownerIds])];
    let usersInfo: UserResponse[] = [];
    if (allUserIds.length > 0) {
      try {
        usersInfo = await this.userHttpClient.getUsersByIds(allUserIds);
      } catch (error) {
        console.error('Error fetching users info:', error);
      }
    }

    // Map UserResponse to UserInfoDto
    const mapUserToDto = (user: UserResponse | null): UserInfoDto | null => {
      if (!user) return null;
      return {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      };
    };

    // Transform requests to DTOs
    const result: JoinRequestResponseDto[] = requests.map((request) => {
      // Find corresponding workspace
      const workspace = workspaces.find(
        (ws) => ws && ws._id.toString() === request.workspace_id.toString(),
      );
      if (!workspace) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      // Find workspace members
      const workspaceMembersResult = allMembersResults.find(
        (result) => result && result.workspaceId === workspace._id.toString(),
      );
      const workspaceMembers = workspaceMembersResult?.members || [];

      // Find owner
      const owner = workspaceMembers.find((member) => member.role === 'admin');
      const ownerInfo = usersInfo.find(
        (user) => user.user_id === owner?.user_id.toString(),
      );

      // Find requester info (this should be the current user)
      const requesterInfo = usersInfo.find(
        (user) => user.user_id === request.requester_id.toString(),
      );

      // Get member count
      const memberCount = workspaceMembers.length;

      // Create workspace info DTO
      const workspaceInfo: WorkspaceInfoDto = {
        id: workspace._id.toString(),
        name: workspace.name,
        description: workspace.description || '',
        hasPassword: !!workspace.password,
        memberCount: memberCount,
        owner: mapUserToDto(ownerInfo || null),
      };

      // Create join request response DTO
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
    // Check if user has ACCEPT_MEMBER permission
    console.log('Approving join request:', {
      workspaceId,
      userId,
      targetUserId,
    });
    await this.permissionService.checkAcceptMemberPermission(
      workspaceId,
      userId,
    );

    // Find the join request by workspaceId, targetUserId, and type
    const request =
      await this.workspaceRepository.getJoinRequestByUserAndWorkspace(
        workspaceId,
        targetUserId,
        'request',
      );

    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Add user as member
    await this.workspaceRepository.addMember(workspaceId, targetUserId, 'user');
    await this.workspaceRepository.incrementMemberCount(workspaceId);

    // Delete the join request
    await this.workspaceRepository.deleteJoinRequest(request._id.toString());
  }

  async rejectJoinRequest(
    workspaceId: string,
    userId: string,
    targetUserId: string,
  ): Promise<void> {
    // Check if user has ACCEPT_MEMBER permission
    await this.permissionService.checkAcceptMemberPermission(
      workspaceId,
      userId,
    );

    // Find the join request by workspaceId, targetUserId, and type
    const request =
      await this.workspaceRepository.getJoinRequestByUserAndWorkspace(
        workspaceId,
        targetUserId,
        'request',
      );

    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Delete the join request (rejection means removal)
    await this.workspaceRepository.deleteJoinRequest(request._id.toString());
  }

  async cancelJoinRequest(userId: string, requestId: string): Promise<void> {
    // Get request info to verify ownership
    const request =
      await this.workspaceRepository.getJoinRequestById(requestId);

    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Check if the request belongs to the current user
    if (request.requester_id.toString() !== userId) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // Delete the join request
    await this.workspaceRepository.deleteJoinRequest(requestId);
  }

  async acceptInvitation(userId: string, requestId: string): Promise<void> {
    // Get request info to verify it's an invitation for current user
    const request =
      await this.workspaceRepository.getJoinRequestById(requestId);

    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Check if the invitation is for the current user and is of type 'invite'
    if (
      request.target_user_id.toString() !== userId ||
      request.type !== 'invite'
    ) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // Add user as member
    await this.workspaceRepository.addMember(
      request.workspace_id.toString(),
      userId,
      'user',
    );
    await this.workspaceRepository.incrementMemberCount(
      request.workspace_id.toString(),
    );

    // Delete the invitation request
    await this.workspaceRepository.deleteJoinRequest(requestId);
  }

  async rejectInvitation(userId: string, requestId: string): Promise<void> {
    // Get request info to verify it's an invitation
    const request =
      await this.workspaceRepository.getJoinRequestById(requestId);

    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Check if it's an invitation
    if (request.type !== 'invite') {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // Check if user is either the target user (person invited) or has ACCEPT_MEMBER permission
    const isTargetUser = request.target_user_id.toString() === userId;
    let hasAcceptPermission = false;

    if (!isTargetUser) {
      try {
        // Check if user has ACCEPT_MEMBER permission in the workspace
        await this.permissionService.checkAcceptMemberPermission(
          request.workspace_id.toString(),
          userId,
        );
        hasAcceptPermission = true;
      } catch (error) {
        // User does not have permission
        hasAcceptPermission = false;
      }
    }

    // User must be either the target user or have ACCEPT_MEMBER permission
    if (!isTargetUser && !hasAcceptPermission) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // Simply delete the invitation request (rejection/cancellation)
    await this.workspaceRepository.deleteJoinRequest(requestId);
  }

  // ========== Helper Methods ==========
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
    // Check if requester has MANAGE_MEMBERS permission
    await this.permissionService.checkManageMembersPermission(
      workspaceId,
      adminUserId,
    );

    let userToBan: string;

    if (requestId) {
      // Case 1: Ban user from a join request
      const joinRequest =
        await this.workspaceRepository.getJoinRequestById(requestId);
      if (!joinRequest) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      if (joinRequest.workspace_id.toString() !== workspaceId) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      userToBan = joinRequest.target_user_id.toString();

      // Delete the join request since we're banning the user
      await this.workspaceRepository.deleteJoinRequest(requestId);
    } else if (targetUserId) {
      // Case 2: Ban user by userId
      userToBan = targetUserId;

      // Check if user has any pending requests and delete them
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

      // Also check for any pending invitations
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
      throw new AppException(ErrorCode.UNAUTHORIZED); // Reuse existing error code
    }

    // Check if user is already a member
    const existingMember = await this.workspaceRepository.getMember(
      workspaceId,
      userToBan,
    );

    if (existingMember) {
      // If user is already a member, update their status to banned
      await this.workspaceRepository.updateMemberStatus(
        workspaceId,
        userToBan,
        'banned',
      );
    } else {
      // If user is not a member, add them as banned member using repository
      await this.workspaceRepository.addMember(workspaceId, userToBan);
      // Then update status to banned
      await this.workspaceRepository.updateMemberStatus(
        workspaceId,
        userToBan,
        'banned',
      );
    }

    // Emit WebSocket event for ban
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
    // Check if requester has MANAGE_MEMBERS permission
    await this.permissionService.checkManageMembersPermission(
      workspaceId,
      adminUserId,
    );

    // Check if target user exists and is banned
    const existingMember = await this.workspaceRepository.getMember(
      workspaceId,
      targetUserId,
    );

    if (!existingMember) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    if (existingMember.status !== 'banned') {
      throw new AppException(ErrorCode.UNAUTHORIZED); // User is not banned
    }

    if (action === 'remove') {
      // Remove user completely from workspace
      await this.workspaceRepository.removeMember(workspaceId, targetUserId);
      // Note: We don't decrement member count for banned users as they weren't counted
    } else if (action === 'unban') {
      // Change status from banned to active
      await this.workspaceRepository.updateMemberStatus(
        workspaceId,
        targetUserId,
        'active',
      );
      // Update member count since user is now active
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
    // Check if requester has MANAGE_PERMISSIONS permission
    await this.permissionService.checkManagePermissionsPermission(
      workspaceId,
      userId,
    );

    // Additional check: if trying to grant MANAGE_PERMISSIONS, only owner can do it
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

    // Get current member permissions
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
        // Add new permissions to existing ones
        newPermissions = [...new Set([...member.permissions, ...permissions])];
        break;
      case 'revoke':
        // Remove specified permissions
        newPermissions = member.permissions.filter(
          (p) => !permissions.includes(p as Permission),
        );
        break;
      case 'set':
      default:
        // Replace all permissions
        newPermissions = permissions;
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

  /**
   * Remove member completely from workspace (not ban, just remove)
   * Only owner or users with MANAGE_MEMBERS permission can remove members
   */
  async removeMemberFromWorkspace(
    workspaceId: string,
    adminUserId: string,
    targetUserId: string,
  ): Promise<void> {
    // Check if requester has MANAGE_MEMBERS permission
    await this.permissionService.checkManageMembersPermission(
      workspaceId,
      adminUserId,
    );

    // Cannot remove owner
    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);
    if (workspace.owner_id.toString() === targetUserId) {
      throw new AppException(ErrorCode.UNAUTHORIZED); // Cannot remove owner
    }

    // Check if target user exists in workspace
    const member = await this.workspaceRepository.getMember(
      workspaceId,
      targetUserId,
    );
    if (!member) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Remove member completely from workspace
    await this.workspaceRepository.removeMember(workspaceId, targetUserId);

    // Decrease member count only if the member was active
    if (member.status === 'active') {
      await this.workspaceRepository.decrementMemberCount(workspaceId);
    }

    // Emit WebSocket event for removal
    this.workspaceGateway.emitUserRemoved(workspaceId, {
      targetUserId,
      removedBy: adminUserId,
    });
  }

  // ========== Access Verification Methods ==========
  async getWorkspaceBasicInfo(
    workspaceId: string,
    userId: string,
  ): Promise<Workspace> {
    // First verify user has access
    const hasAccess = await this.verifyUserAccess(workspaceId, userId);
    if (!hasAccess) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // Return basic workspace info
    return await this.workspaceRepository.getWorkspaceById(workspaceId);
  }

  async verifyUserAccess(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      // Check if workspace exists
      const workspace =
        await this.workspaceRepository.getWorkspaceById(workspaceId);
      if (!workspace) {
        return false;
      }

      // Check if user is an active member of the workspace
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
}
