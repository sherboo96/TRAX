export enum LocationCategory {
  OnSite = 0,
  OutSite = 1,
  OnlineVideo = 2,
  Abroad = 3,
}

export interface Location {
  id: number;
  nameEn: string;
  nameAr?: string;
  addressEn?: string;
  addressAr?: string;
  city?: string;
  country?: string;
  category: LocationCategory;
  templateUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLocationDto {
  nameEn: string;
  nameAr?: string;
  addressEn?: string;
  addressAr?: string;
  city?: string;
  country?: string;
  category: LocationCategory;
  isActive?: boolean;
  templateFile?: File;
}

export type UpdateLocationDto = CreateLocationDto;

export interface ApiResponse<T> {
  statusCode: number;
  message?: string;
  result: T;
}
