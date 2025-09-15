import { RegistrationStatus } from './registration-status.model';

export interface SuggestedCourse {
  id: number;
  title: string;
  description: string;
  priority: number;
  isForDepartment: boolean;
  registerationStatusId: number;
  registerationStatus: RegistrationStatus;
  createdAt: string;
  createdBy: number;
  isActive: boolean;
  isDeleted: boolean;
}

export interface CreateSuggestedCourseDto {
  title: string;
  description: string;
  priority: number;
  isForDepartment: boolean;
  registerationStatusId: number;
}

export interface UpdateSuggestedCourseDto {
  title: string;
  description: string;
  priority: number;
  isForDepartment: boolean;
  registerationStatusId: number;
}

export interface SuggestedCourseResponse {
  statusCode: number;
  success: boolean;
  result: SuggestedCourse[];
  message: string;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
}
