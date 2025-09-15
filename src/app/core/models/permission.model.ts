export interface Permission {
  id: number;
  name: string;
  permissionKey: string;
  resource: string;
  action: string;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
  isGranted: boolean;
  permissionName: string;
  permissionKey: string;
  resource: string;
  action: string;
}

export interface PermissionResponse {
  statusCode: number;
  success: boolean;
  result: Permission[];
  message: string;
}
