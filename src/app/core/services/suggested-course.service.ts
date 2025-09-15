import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import {
  SuggestedCourse,
  CreateSuggestedCourseDto,
  UpdateSuggestedCourseDto,
  SuggestedCourseResponse,
} from '../models/suggested-course.model';
import { PaginationRequest } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class SuggestedCourseService {
  private apiUrl = `${environment.apiUrl}/SuggestedCourses`;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  // Get all suggested courses with pagination
  getSuggestedCourses(
    pagination: PaginationRequest
  ): Observable<SuggestedCourseResponse> {
    const params = new URLSearchParams();
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.pageSize)
      params.append('pageSize', pagination.pageSize.toString());
    if (pagination.order) params.append('order', pagination.order);
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);

    return this.http
      .get<SuggestedCourseResponse>(`${this.apiUrl}?${params.toString()}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get suggested course by ID
  getSuggestedCourse(id: number): Observable<SuggestedCourse> {
    return this.http
      .get<SuggestedCourse>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Create new suggested course
  createSuggestedCourse(
    suggestedCourse: CreateSuggestedCourseDto
  ): Observable<SuggestedCourse> {
    return this.http
      .post<SuggestedCourse>(this.apiUrl, suggestedCourse)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Update suggested course
  updateSuggestedCourse(
    id: number,
    suggestedCourse: UpdateSuggestedCourseDto
  ): Observable<SuggestedCourse> {
    return this.http
      .put<SuggestedCourse>(`${this.apiUrl}/${id}`, suggestedCourse)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Delete suggested course
  deleteSuggestedCourse(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.status === 403) {
      errorMessage =
        'Access denied. You do not have permission to perform this action.';
      this.toastr.error(errorMessage, 'Forbidden');
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized. Please log in again.';
      this.toastr.error(errorMessage, 'Unauthorized');
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
      this.toastr.error(errorMessage, 'Not Found');
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
      this.toastr.error(errorMessage, 'Server Error');
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
      this.toastr.error(errorMessage, 'Error');
    } else {
      this.toastr.error(errorMessage, 'Error');
    }

    return throwError(() => error);
  }
}
