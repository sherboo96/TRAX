import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import { map } from 'rxjs/operators';

export interface CourseFilterRequest {
  title?: string;
  description?: string;
  category?: number;
  level?: number;
  status?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface Instructor {
  id: number;
  nameEn: string;
}

export interface TargetDepartment {
  id: number;
  nameEn: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  timeFrom: string;
  timeTo: string;
  availableSeats: number;
  category: number;
  onlineRepeated: boolean;
  level: number;
  duration: string;
  price: number;
  kpiWeight: number;
  image: string;
  statusId: number;
  statusName: string;
  targetDepartments: TargetDepartment[];
  instructors: Instructor[];
  requirements: string[];
  learningOutcomes: string[];
  lastUpdated: string;
  language: string;
  certificate: boolean;
  registerationClosedAt: string;
  isUserRegistered?: boolean;
  userRegistrationStatusId?: number;
  userRegistrationStatusName?: string;
}

export interface CourseFilterResponse extends PaginatedResponse<Course> {}

export interface CourseResponse {
  statusCode: number;
  success: boolean;
  result: Course;
  message: string;
}

export interface DepartmentCoursesResponse {
  statusCode: number;
  result: Course[];
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/Courses`;

  constructor(private http: HttpClient) {}

  filterCourses(
    filterRequest: CourseFilterRequest
  ): Observable<CourseFilterResponse> {
    return this.http.get<CourseFilterResponse>(`${this.apiUrl}`);
  }

  getCourseById(id: number): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.apiUrl}/${id}`);
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  updateCourse(id: number, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCourseEnrollments(courseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${courseId}/registrations`);
  }

  getCourseAttendances(
    courseId: number,
    date: string,
    page: number,
    pageSize: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('date', date)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get(`${this.apiUrl}/${courseId}/attendances`, { params });
  }

  approveRegistration(
    courseId: number,
    registrationId: number
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${courseId}/registrations/${registrationId}/approve`,
      {}
    );
  }

  rejectRegistration(
    courseId: number,
    registrationId: number
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${courseId}/registrations/${registrationId}/reject`,
      {}
    );
  }

  enrollInCourse(courseId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${courseId}/enroll`, {});
  }

  publishCourse(courseId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${courseId}/publish`, {});
  }

  unpublishCourse(courseId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${courseId}/unpublish`, {});
  }

  archiveCourse(courseId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${courseId}/archive`, {});
  }

  toggleStatus(courseId: number, publish: boolean): Observable<any> {
    const params = new HttpParams().set('publish', publish.toString());
    return this.http.patch<any>(
      `${this.apiUrl}/${courseId}/toggle-status`,
      {},
      { params }
    );
  }

  makeActive(courseId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${courseId}/make-active`, {});
  }

  getAttendanceQR(courseId: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/${courseId}/attandQR`, {
        responseType: 'blob',
      })
      .pipe(
        map((blob) => {
          console.log('QR Blob received:', blob);
          console.log('Blob type:', blob.type);
          console.log('Blob size:', blob.size);

          // Create a URL for the blob (file)
          const url = URL.createObjectURL(blob);
          console.log('Created blob URL:', url);

          return {
            qrCodeUrl: url,
            type: 'file',
            blob: blob,
            mimeType: blob.type,
            size: blob.size,
          };
        })
      );
  }

  getCourseQR(courseId: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/${courseId}/qr`, {
        responseType: 'blob',
      })
      .pipe(
        map((blob) => {
          console.log('Course QR Blob received:', blob);
          console.log('Blob type:', blob.type);
          console.log('Blob size:', blob.size);

          // Create a URL for the blob (file)
          const url = URL.createObjectURL(blob);
          console.log('Created course QR blob URL:', url);

          return {
            qrCodeUrl: url,
            type: 'file',
            blob: blob,
            mimeType: blob.type,
            size: blob.size,
          };
        })
      );
  }

  scanAttendance(courseId: string, token: string): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.get<any>(`${this.apiUrl}/${courseId}/scan`, { params });
  }

  registerForCourse(courseId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${courseId}/register`, {});
  }

  getDepartmentCourses(): Observable<DepartmentCoursesResponse> {
    return this.http.get<DepartmentCoursesResponse>(
      `${this.apiUrl}/my-department`
    );
  }
}
