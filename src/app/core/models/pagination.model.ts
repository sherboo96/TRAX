export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  success: boolean;
  result: T[];
  message: string;
  pagination: PaginationInfo;
}

export interface PaginationRequest {
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  sortBy?: string;
}
