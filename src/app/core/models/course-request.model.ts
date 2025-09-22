export interface CourseRequest {
  id: number;
  userId: number;
  userFullNameEn: string;
  userFullNameAr: string;
  userEmail: string;
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  courseStartDate: Date;
  courseEndDate: Date;
  departmentId: number;
  departmentNameEn: string;
  departmentNameAr: string;
  requestStatusId: number;
  requestStatusNameEn: string;
  requestStatusNameAr: string;
  approvedByUserId?: number;
  approvedByUserName?: string;
  approvedAt?: Date;
  comments?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseRequestDto {
  courseId: number;
  comments?: string;
}

export interface UpdateCourseRequestStatusDto {
  requestStatusId: number;
  comments?: string;
  rejectionReason?: string;
}

export interface CourseRequestFilterDto {
  departmentId?: number;
  requestStatusId?: number;
  courseId?: number;
  userId?: number;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  pageSize: number;
}
