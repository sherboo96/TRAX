export interface DepartmentTreeNode {
  id: number;
  nameEn: string;
  nameAr?: string;
  type: string;
  mainType?: string;
  baseDepartmentId?: number;
  organizationId: number;
  orgRecordId?: number;
  kpiWeigth?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;

  // Tree structure properties
  children: DepartmentTreeNode[];
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;

  // Display properties
  displayName: string;
  organizationName: string;
  baseDepartmentName: string;
}

export interface CreateDepartmentDto {
  nameEn: string;
  nameAr?: string;
  kpiWeigth?: number;
  type: string;
  baseDepartmentId?: number;
  mainType?: string;
  organizationId: number;
  orgRecordId?: number;
}

export interface UpdateDepartmentDto {
  nameEn: string;
  nameAr?: string;
  kpiWeigth?: number;
  type: string;
  baseDepartmentId?: number;
  mainType?: string;
  organizationId: number;
  orgRecordId?: number;
}
