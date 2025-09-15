export interface Institution {
  id: number;
  nameEn: string;
  nameAr: string;
  createdAt: string;
  createdBy: number;
  isActive: boolean;
  isDeleted: boolean;
}

export interface CreateInstitutionDto {
  nameEn: string;
  nameAr: string;
}

export interface UpdateInstitutionDto {
  nameEn: string;
  nameAr: string;
}

export interface InstitutionResponse {
  statusCode: number;
  success: boolean;
  result: Institution[];
  message: string;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
}
