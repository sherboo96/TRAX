import { Organization } from './organization.model';

export interface Department {
  id: number;
  nameEn: string;
  nameAr?: string;
  type: string;
  mainType?: string;
  baseDepartmentId?: number;
  organizationId: number;
  organization?: Organization;
  orgRecordId?: number;
  kpiWeigth?: number;
  createdAt: string;
  createdBy?: number;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CreateDepartmentDto {
  nameEn: string;
  nameAr?: string;
  type: string;
  mainType?: string;
  baseDepartmentId?: number;
  organizationId: number;
  orgRecordId?: number;
  kpiWeigth?: number;
}

export interface UpdateDepartmentDto {
  nameEn: string;
  nameAr?: string;
  type: string;
  mainType?: string;
  baseDepartmentId?: number;
  organizationId: number;
  orgRecordId?: number;
  kpiWeigth?: number;
}

export interface DepartmentResponse<T = Department[]> {
  statusCode: number;
  result: T;
  message: string;
  pagination?: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
}

export interface PaginatedDepartmentResponse {
  statusCode: number;
  result: Department[];
  message: string;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
}
