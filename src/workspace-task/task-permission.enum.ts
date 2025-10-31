/**
 * Task Permission Types
 * Controls what actions members can perform on workspace tasks
 */
export enum TaskPermissionType {
  // Viewing permissions
  VIEW_ALL = 'VIEW_ALL', // Can view all tasks in workspace
  VIEW_ASSIGNED = 'VIEW_ASSIGNED', // Can only view tasks assigned to them

  // Editing permissions
  EDIT_ALL = 'EDIT_ALL', // Can edit any task
  EDIT_ASSIGNED = 'EDIT_ASSIGNED', // Can only edit assigned tasks
  EDIT_OWN = 'EDIT_OWN', // Can only edit tasks they created

  // Deletion permissions
  DELETE_ALL = 'DELETE_ALL', // Can delete any task
  DELETE_ASSIGNED = 'DELETE_ASSIGNED', // Can delete assigned tasks
  DELETE_OWN = 'DELETE_OWN', // Can only delete own tasks

  // Creation permissions
  CREATE_TASK = 'CREATE_TASK', // Can create new tasks

  // Assignment permissions
  ASSIGN_TASK = 'ASSIGN_TASK', // Can assign tasks to members

  // Ownership transfer
  TRANSFER_OWNERSHIP = 'TRANSFER_OWNERSHIP', // Can transfer task ownership
}

/**
 * Task Role Presets - Combine multiple permissions
 */
export enum TaskRolePreset {
  OWNER = 'OWNER', // Full control - all permissions
  ADMIN = 'ADMIN', // Can manage all tasks
  EDITOR = 'EDITOR', // Can create, edit, assign tasks
  VIEWER = 'VIEWER', // Can only view tasks assigned to them
  RESTRICTED = 'RESTRICTED', // Minimal access
}

export const ROLE_PERMISSIONS: Record<TaskRolePreset, TaskPermissionType[]> = {
  [TaskRolePreset.OWNER]: [
    TaskPermissionType.VIEW_ALL,
    TaskPermissionType.EDIT_ALL,
    TaskPermissionType.DELETE_ALL,
    TaskPermissionType.CREATE_TASK,
    TaskPermissionType.ASSIGN_TASK,
    TaskPermissionType.TRANSFER_OWNERSHIP,
  ],
  [TaskRolePreset.ADMIN]: [
    TaskPermissionType.VIEW_ALL,
    TaskPermissionType.EDIT_ALL,
    TaskPermissionType.DELETE_ALL,
    TaskPermissionType.CREATE_TASK,
    TaskPermissionType.ASSIGN_TASK,
  ],
  [TaskRolePreset.EDITOR]: [
    TaskPermissionType.VIEW_ALL,
    TaskPermissionType.EDIT_ASSIGNED,
    TaskPermissionType.DELETE_OWN,
    TaskPermissionType.CREATE_TASK,
    TaskPermissionType.ASSIGN_TASK,
  ],
  [TaskRolePreset.VIEWER]: [
    TaskPermissionType.VIEW_ASSIGNED,
  ],
  [TaskRolePreset.RESTRICTED]: [
    TaskPermissionType.VIEW_ASSIGNED,
    TaskPermissionType.EDIT_ASSIGNED,
  ],
};
