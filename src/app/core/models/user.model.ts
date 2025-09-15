export interface Department {
  id: number;
  name: string;
  organization: Organization;
  createdAt: string;
}

export interface Organization {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  website: string;
  createdAt: string;
}

export interface User {
  id?: number;
  fullNameAr: string;
  fullNameEn: string;
  adUserName?: string;
  email: string;
  civilNo: string;
  phoneNumber: string;
  userPic?: string;
  orgRecordId: number;
  createdAt?: string;
  createdBy?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  department?: Department;
  roleId?: number;
  userType?: number;
}

export enum UserRole {
  USER = 0,
  ADMIN = 1,
  MODERATOR = 2,
}

export interface LoginRequest {
  civilNo: string;
  password: string;
}

export interface LoginResponse {
  statusCode: number;
  result: {
    token: string;
    user: User;
  };
  message: string;
}

// New interface for the actual API response structure
export interface ApiLoginResponse {
  statusCode: number;
  result: {
    user: User;
    token: string;
  };
  message: string;
}
