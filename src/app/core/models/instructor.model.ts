export interface Instructor {
  id: number;
  nameEn: string;
  nameAr: string;
  bio: string;
  email: string;
  phone: string;
  institutionId: number;
  fullName?: string; // Computed property for display
  specialty?: string; // Specialty field
  institution?: {
    id: number;
    nameAr: string;
    nameEn: string;
    createdAt: string;
    createdBy: number;
    isActive: boolean;
    isDeleted: boolean;
  };
  createdAt: string;
  createdBy: number;
  isActive: boolean;
  isDeleted: boolean;
}

export interface CreateInstructorDto {
  nameEn: string;
  nameAr: string;
  bio: string;
  email: string;
  phone: string;
  institutionId: number;
}

export interface UpdateInstructorDto {
  nameEn: string;
  nameAr: string;
  bio: string;
  email: string;
  phone: string;
  institutionId: number;
}

export interface InstructorResponse {
  statusCode: number;
  success: boolean;
  result: Instructor[];
  message: string;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
}
