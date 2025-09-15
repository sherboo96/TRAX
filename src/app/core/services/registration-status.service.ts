import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import {
  RegistrationStatus,
  RegistrationStatusResponse,
} from '../models/registration-status.model';
import { PaginationRequest } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationStatusService {
  private apiUrl = `${environment.apiUrl}/registerationStatus`;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  // Get all registration statuses with pagination
  getRegistrationStatuses(
    pagination: PaginationRequest
  ): Observable<RegistrationStatusResponse> {
    const params = new URLSearchParams();
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.pageSize)
      params.append('pageSize', pagination.pageSize.toString());
    if (pagination.order) params.append('order', pagination.order);
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);

    return this.http
      .get<RegistrationStatusResponse>(`${this.apiUrl}?${params.toString()}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get registration status by ID
  getRegistrationStatus(id: number): Observable<RegistrationStatus> {
    return this.http
      .get<RegistrationStatus>(`${this.apiUrl}/${id}`)
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
