export interface UserAdmin {
  id: number;
  fullNameAr: string;
  fullNameEn: string;
  adUserName: string;
  email: string;
  civilNo: string;
  phoneNumber: string;
  userPic: string | number[];
  orgRecordId: number;
  createdAt: string;
  createdBy: number;
  isActive: boolean;
  isDeleted: boolean;
  roleId?: number;
  status?: string;
  imageError?: boolean;
  imageLoaded?: boolean;
}

export interface CreateUserAdminDto {
  fullNameAr: string;
  fullNameEn: string;
  adUserName: string;
  email: string;
  civilNo: string;
  phoneNumber: string;
  roleId?: number;
}

export interface UpdateUserAdminDto {
  fullNameAr: string;
  fullNameEn: string;
  adUserName: string;
  email: string;
  civilNo: string;
  phoneNumber: string;
  roleId?: number;
}

export interface UserAdminResponse {
  statusCode: number;
  success: boolean;
  result: UserAdmin[];
  message: string;
}
