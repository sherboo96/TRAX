import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CourseRequest,
  CreateCourseRequestDto,
  UpdateCourseRequestStatusDto,
  CourseRequestFilterDto,
} from '../models/course-request.model';
import { BaseResponse } from '../models/base-response.model';
import { PaginatedResult } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class CourseRequestService {
  private apiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  // Get requests for current user's department
  getRequestsForDepartment(
    page: number = 1,
    pageSize: number = 10
  ): Observable<BaseResponse<CourseRequest[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<BaseResponse<CourseRequest[]>>(
      `${this.apiUrl}/my-department`,
      { params }
    );
  }

  // Get pending requests for current user's department
  getPendingRequests(): Observable<BaseResponse<CourseRequest[]>> {
    return this.http.get<BaseResponse<CourseRequest[]>>(
      `${this.apiUrl}/pending`
    );
  }

  // Get requests for current user
  getMyRequests(
    page: number = 1,
    pageSize: number = 10
  ): Observable<BaseResponse<CourseRequest[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<BaseResponse<CourseRequest[]>>(
      `${this.apiUrl}/my-requests`,
      { params }
    );
  }

  // Get request by ID
  getRequestById(id: number): Observable<BaseResponse<CourseRequest>> {
    return this.http.get<BaseResponse<CourseRequest>>(`${this.apiUrl}/${id}`);
  }

  // Create a new request
  createRequest(
    dto: CreateCourseRequestDto
  ): Observable<BaseResponse<CourseRequest>> {
    return this.http.post<BaseResponse<CourseRequest>>(this.apiUrl, dto);
  }

  // Approve a request
  approveRequest(
    id: number,
    dto: UpdateCourseRequestStatusDto
  ): Observable<BaseResponse<string>> {
    return this.http.patch<BaseResponse<string>>(
      `${this.apiUrl}/${id}/approve`,
      dto
    );
  }

  // Reject a request
  rejectRequest(
    id: number,
    dto: UpdateCourseRequestStatusDto
  ): Observable<BaseResponse<string>> {
    return this.http.patch<BaseResponse<string>>(
      `${this.apiUrl}/${id}/reject`,
      dto
    );
  }

  // Get requests with filter
  getRequestsWithFilter(
    filter: CourseRequestFilterDto
  ): Observable<BaseResponse<PaginatedResult<CourseRequest>>> {
    let params = new HttpParams();

    if (filter.departmentId)
      params = params.set('departmentId', filter.departmentId.toString());
    if (filter.requestStatusId)
      params = params.set('requestStatusId', filter.requestStatusId.toString());
    if (filter.courseId)
      params = params.set('courseId', filter.courseId.toString());
    if (filter.userId) params = params.set('userId', filter.userId.toString());
    if (filter.fromDate)
      params = params.set('fromDate', filter.fromDate.toISOString());
    if (filter.toDate)
      params = params.set('toDate', filter.toDate.toISOString());
    params = params.set('page', filter.page.toString());
    params = params.set('pageSize', filter.pageSize.toString());

    return this.http.get<BaseResponse<PaginatedResult<CourseRequest>>>(
      `${this.apiUrl}/filter`,
      { params }
    );
  }
}
