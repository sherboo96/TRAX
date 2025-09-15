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
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponse,
} from '../models/organization.model';
import { PaginationRequest } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/Organizations`;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  // Get all organizations with pagination
  getOrganizations(
    paginationRequest?: PaginationRequest
  ): Observable<OrganizationResponse> {
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
      .get<OrganizationResponse>(this.apiUrl, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get all organizations (legacy method for backward compatibility)
  getOrganizationsLegacy(): Observable<OrganizationResponse> {
    return this.http
      .get<OrganizationResponse>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get organization by ID
  getOrganization(id: number): Observable<Organization> {
    return this.http
      .get<Organization>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Create new organization
  createOrganization(
    organization: CreateOrganizationDto
  ): Observable<Organization> {
    return this.http
      .post<Organization>(this.apiUrl, organization)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Update organization
  updateOrganization(
    id: number,
    organization: UpdateOrganizationDto
  ): Observable<Organization> {
    return this.http
      .put<Organization>(`${this.apiUrl}/${id}`, organization)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Delete organization
  deleteOrganization(id: number): Observable<void> {
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
        errorMessage = 'Organization not found.';
      } else if (error.status === 409) {
        errorMessage = 'Organization already exists.';
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
