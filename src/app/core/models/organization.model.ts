export interface Organization {
  id: number;
  nameAr: string;
  nameEn: string;
  createdAt: string;
  createdBy: number;
  isActive: boolean;
  isDeleted: boolean;
}

export interface CreateOrganizationDto {
  nameAr: string;
  nameEn: string;
}

export interface UpdateOrganizationDto {
  nameAr: string;
  nameEn: string;
}

export interface OrganizationResponse {
  statusCode: number;
  result: Organization[];
  message: string;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
}
