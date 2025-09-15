import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import {
  UserAdmin,
  CreateUserAdminDto,
  UpdateUserAdminDto,
  UserAdminResponse,
} from '../models/user-admin.model';
import {
  PaginatedResponse,
  PaginationRequest,
} from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class UserAdminService {
  private apiUrl = `${environment.apiUrl}/Users`;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  // Get all users with pagination
  getUsers(
    paginationRequest?: PaginationRequest
  ): Observable<PaginatedResponse<UserAdmin>> {
    let params = new HttpParams();

    if (paginationRequest) {
      if (paginationRequest.page !== undefined) {
        params = params.set('page', paginationRequest.page.toString());
      }
      if (paginationRequest.pageSize !== undefined) {
        params = params.set('pageSize', paginationRequest.pageSize.toString());
      }
      if (paginationRequest.order) {
        params = params.set('order', paginationRequest.order);
      }
      if (paginationRequest.sortBy) {
        params = params.set('sortBy', paginationRequest.sortBy);
      }
    }

    return this.http
      .get<PaginatedResponse<UserAdmin>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get all users (legacy method for backward compatibility)
  getUsersLegacy(): Observable<UserAdminResponse> {
    return this.http
      .get<UserAdminResponse>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get user by ID
  getUser(id: number): Observable<UserAdmin> {
    return this.http
      .get<UserAdmin>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Create new user
  createUser(user: CreateUserAdminDto): Observable<UserAdmin> {
    return this.http
      .post<UserAdmin>(this.apiUrl, user)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Update user
  updateUser(id: number, user: UpdateUserAdminDto): Observable<UserAdmin> {
    return this.http
      .put<UserAdmin>(`${this.apiUrl}/${id}`, user)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Delete user
  deleteUser(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 403) {
        errorMessage =
          'Access denied. You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'User not found.';
      } else if (error.status === 409) {
        errorMessage = 'User already exists.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }

    this.toastr.error(errorMessage, 'Error');
    return throwError(() => new Error(errorMessage));
  }
}
