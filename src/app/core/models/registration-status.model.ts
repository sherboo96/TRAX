export interface RegistrationStatus {
  id: number;
  nameEn: string;
  nameAr: string;
  createdAt: string;
  createdBy: number;
  isActive: boolean;
  isDeleted: boolean;
}

export interface RegistrationStatusResponse {
  statusCode: number;
  success: boolean;
  result: RegistrationStatus[];
  message: string;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
}
