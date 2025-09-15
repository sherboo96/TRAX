import { RolePermission } from './permission.model';

export interface Role {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  rolePermissions: RolePermission[];
}

export interface CreateRoleDto {
  name: string;
  description: string;
  isActive: boolean;
  permissionIds: number[];
}

export interface UpdateRoleDto {
  name: string;
  description: string;
  isActive: boolean;
}

export interface RoleResponse {
  statusCode: number;
  success: boolean;
  result: Role[];
  message: string;
}
