import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponse,
  PaginatedDepartmentResponse,
} from '../models/department.model';
import { DepartmentTreeNode } from '../models/department-tree.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private apiUrl = `${environment.apiUrl}/Departments`;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  // Get all departments with pagination and filters
  getDepartments(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      order?: string;
      isDepartment?: boolean;
      isInspector?: boolean;
      isUpperManagement?: boolean;
    }
  ): Observable<PaginatedDepartmentResponse> {
    let params: any = {
      page: page.toString(),
      pageSize: pageSize.toString(),
    };

    if (filters) {
      if (filters.order) params.order = filters.order;
      if (filters.isDepartment !== undefined)
        params.IsDepartment = filters.isDepartment.toString();
      if (filters.isInspector !== undefined)
        params.IsInspector = filters.isInspector.toString();
      if (filters.isUpperManagement !== undefined)
        params.isUpperManagment = filters.isUpperManagement.toString();
    }

    return this.http
      .get<PaginatedDepartmentResponse>(this.apiUrl, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get all departments without pagination (for dropdowns, etc.)
  getAllDepartments(): Observable<DepartmentResponse> {
    return this.http
      .get<DepartmentResponse>(`${this.apiUrl}/all`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get department by ID
  getDepartment(id: number): Observable<Department> {
    return this.http
      .get<Department>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Create new department
  createDepartment(department: CreateDepartmentDto): Observable<Department> {
    return this.http
      .post<Department>(this.apiUrl, department)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Update department
  updateDepartment(
    id: number,
    department: UpdateDepartmentDto
  ): Observable<Department> {
    return this.http
      .put<Department>(`${this.apiUrl}/${id}`, department)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Delete department
  deleteDepartment(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get department tree
  getDepartmentTree(
    organizationId?: number
  ): Observable<DepartmentResponse<DepartmentTreeNode[]>> {
    let params: any = {};
    if (organizationId) {
      params.organizationId = organizationId.toString();
    }

    return this.http
      .get<DepartmentResponse<DepartmentTreeNode[]>>(`${this.apiUrl}/tree`, {
        params,
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get department tree by org record
  getDepartmentTreeByOrgRecord(
    orgRecordId: number
  ): Observable<DepartmentResponse<DepartmentTreeNode[]>> {
    return this.http
      .get<DepartmentResponse<DepartmentTreeNode[]>>(
        `${this.apiUrl}/tree/${orgRecordId}`
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get full hierarchy analysis
  getHierarchyAnalysis(): Observable<DepartmentResponse<any>> {
    return this.http
      .get<DepartmentResponse<any>>(`${this.apiUrl}/hierarchy-analysis`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get hierarchy analysis for a specific OrgRecordId
  getOrgRecordHierarchy(
    orgRecordId: number
  ): Observable<DepartmentResponse<any>> {
    return this.http
      .get<DepartmentResponse<any>>(
        `${this.apiUrl}/hierarchy-analysis/org-record/${orgRecordId}`
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get departments by base department ID
  getDepartmentsByBaseDepartmentId(
    baseDepartmentId: number
  ): Observable<DepartmentResponse<Department[]>> {
    return this.http
      .get<DepartmentResponse<Department[]>>(
        `${this.apiUrl}/base-department/${baseDepartmentId}`
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get departments where BaseDepartmentId equals OrgRecordId
  getDepartmentsByOrgRecordAsBaseDepartment(
    orgRecordId: number
  ): Observable<DepartmentResponse<any>> {
    return this.http
      .get<DepartmentResponse<any>>(
        `${this.apiUrl}/org-record/${orgRecordId}/as-base-department`
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get complete department tree with recursive children
  getCompleteDepartmentTree(
    rootDepartmentId?: number
  ): Observable<DepartmentResponse<any>> {
    let params: any = {};
    if (rootDepartmentId) {
      params.rootDepartmentId = rootDepartmentId.toString();
    }

    return this.http
      .get<DepartmentResponse<any>>(`${this.apiUrl}/complete-tree`, { params })
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
        errorMessage = 'Department not found.';
      } else if (error.status === 409) {
        errorMessage = 'Department already exists.';
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
