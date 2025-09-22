import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import {
  Instructor,
  CreateInstructorDto,
  UpdateInstructorDto,
  InstructorResponse,
} from '../models/instructor.model';
import { PaginationRequest } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class InstructorService {
  private apiUrl = `${environment.apiUrl}/Instractors`;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  // Get all instructors
  getInstructors(
    pagination: PaginationRequest
  ): Observable<InstructorResponse> {
    const params = new URLSearchParams();
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.pageSize)
      params.append('pageSize', pagination.pageSize.toString());
    if (pagination.order) params.append('order', pagination.order);
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);

    return this.http
      .get<InstructorResponse>(`${this.apiUrl}?${params.toString()}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Get instructor by ID
  getInstructor(id: number): Observable<Instructor> {
    return this.http
      .get<Instructor>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Create new instructor
  createInstructor(instructor: CreateInstructorDto): Observable<Instructor> {
    const formData = new FormData();

    // Append all instructor properties with exact DTO property names
    formData.append('NameEn', instructor.nameEn);
    formData.append('NameAr', instructor.nameAr);
    formData.append('Bio', instructor.bio);
    formData.append('Email', instructor.email);
    formData.append('Phone', instructor.phone);
    formData.append('InstitutionId', instructor.institutionId.toString());

    // Append image file if provided
    if (instructor.imageFile) {
      formData.append('ImageFile', instructor.imageFile);
    }

    return this.http
      .post<Instructor>(this.apiUrl, formData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Update instructor
  updateInstructor(
    id: number,
    instructor: UpdateInstructorDto
  ): Observable<Instructor> {
    const formData = new FormData();

    // Append all instructor properties with exact DTO property names
    formData.append('NameEn', instructor.nameEn);
    formData.append('NameAr', instructor.nameAr);
    formData.append('Bio', instructor.bio);
    formData.append('Email', instructor.email);
    formData.append('Phone', instructor.phone);
    formData.append('InstitutionId', instructor.institutionId.toString());

    // Append image file if provided
    if (instructor.imageFile) {
      formData.append('ImageFile', instructor.imageFile);
    }

    return this.http
      .put<Instructor>(`${this.apiUrl}/${id}`, formData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Delete instructor
  deleteInstructor(id: number): Observable<void> {
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
        errorMessage = 'Instructor not found.';
      } else if (error.status === 409) {
        errorMessage = 'Instructor already exists.';
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
