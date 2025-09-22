export interface BaseResponse<T = any> {
  statusCode: number;
  message: string;
  result?: T;
  success?: boolean;
  errors?: string[];
}
