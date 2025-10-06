import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';

export interface CourseFilterRequest {
  title?: string;
  description?: string;
  category?: string;
  level?: string;
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

export interface SimpleLocation {
  id?: number;
  nameEn?: string;
  nameAr?: string;
}

export interface Course {
  id: number;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  location: string | SimpleLocation;
  locationId?: number; // optional for create/update
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
  isForAllEmployees: boolean;
  registerationClosedAt: string;
  isUserRegistered?: boolean;
  userRegistrationStatusId?: number;
  userRegistrationStatusName?: string;
  // Additional properties for course creation
  targetDepartmentIds?: number[];
  instructorIds?: number[];
  imageFile?: File;
}

export interface CourseFilterResponse {
  statusCode: number;
  success: boolean;
  result: {
    items: Course[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message: string;
}

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
    let params = new HttpParams();
    
    if (filterRequest.title) params = params.set('title', filterRequest.title);
    if (filterRequest.description) params = params.set('description', filterRequest.description);
    if (filterRequest.category) params = params.set('category', filterRequest.category);
    if (filterRequest.level) params = params.set('level', filterRequest.level);
    if (filterRequest.status) params = params.set('status', filterRequest.status.toString());
    if (filterRequest.page !== undefined) params = params.set('page', filterRequest.page.toString());
    if (filterRequest.pageSize) params = params.set('pageSize', filterRequest.pageSize.toString());
    if (filterRequest.sortBy) params = params.set('sortBy', filterRequest.sortBy);
    if (filterRequest.sortOrder) params = params.set('sortOrder', filterRequest.sortOrder);
    
    
    return this.http.get<CourseFilterResponse>(`${this.apiUrl}/filter`, { params });
  }

  getCourseById(id: number): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.apiUrl}/${id}`);
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    const formData = new FormData();

    // Add all the course properties to FormData
    if (course.title) formData.append('Title', course.title);
    if (course.description) formData.append('Description', course.description);
    // Prefer sending LocationId when provided (numeric foreign key)
    if (course.locationId !== undefined && course.locationId !== null) {
      formData.append('LocationId', course.locationId.toString());
    } else if (typeof course.location === 'string' && course.location) {
      formData.append('Location', course.location);
    }
    if (course.startDate) formData.append('StartDate', course.startDate);
    if (course.endDate) formData.append('EndDate', course.endDate);
    if (course.timeFrom) formData.append('TimeFrom', course.timeFrom);
    if (course.timeTo) formData.append('TimeTo', course.timeTo);
    if (course.availableSeats !== undefined)
      formData.append('AvailableSeats', course.availableSeats.toString());
    if (course.category !== undefined)
      formData.append('Category', course.category.toString());
    if (course.onlineRepeated !== undefined)
      formData.append('OnlineRepeated', course.onlineRepeated.toString());
    if (course.level !== undefined)
      formData.append('Level', course.level.toString());
    if (course.duration) formData.append('Duration', course.duration);
    if (course.price !== undefined)
      formData.append('Price', course.price.toString());
    if (course.kpiWeight !== undefined)
      formData.append('KPIWeight', course.kpiWeight.toString());
    if (course.statusId !== undefined)
      formData.append('StatusId', course.statusId.toString());
    if (course.language) formData.append('Language', course.language);
    if (course.certificate !== undefined)
      formData.append('Certificate', course.certificate.toString());
    if (course.isForAllEmployees !== undefined)
      formData.append('IsForAllEmployees', course.isForAllEmployees.toString());
    if (course.registerationClosedAt)
      formData.append('RegisterationClosedAt', course.registerationClosedAt);

    // Add arrays
    if (course.requirements && course.requirements.length > 0) {
      course.requirements.forEach((req, index) => {
        formData.append(`Requirements[${index}]`, req);
      });
    }

    if (course.learningOutcomes && course.learningOutcomes.length > 0) {
      course.learningOutcomes.forEach((outcome, index) => {
        formData.append(`LearningOutcomes[${index}]`, outcome);
      });
    }

    if (course.targetDepartmentIds && course.targetDepartmentIds.length > 0) {
      course.targetDepartmentIds.forEach((id: number, index: number) => {
        formData.append(`TargetDepartmentIds[${index}]`, id.toString());
      });
    }
    if (course.isForAllEmployees !== undefined) {
      formData.append('IsForAllEmployees', course.isForAllEmployees.toString());
    }

    if (course.instructorIds && course.instructorIds.length > 0) {
      course.instructorIds.forEach((id: number, index: number) => {
        formData.append(`InstructorIds[${index}]`, id.toString());
      });
    }

    // Add image file if present
    if (course.imageFile) {
      formData.append('ImageFile', course.imageFile);
      console.log(
        'Image file added to FormData:',
        course.imageFile.name,
        course.imageFile.size,
        'bytes'
      );
    } else {
      console.log('No image file to upload');
    }

    // Debug: Log FormData contents
    console.log('FormData contents:');
    for (let pair of (formData as any).entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    return this.http.post<Course>(this.apiUrl, formData);
  }

  updateCourse(id: number, course: Partial<Course>): Observable<Course> {
    const formData = new FormData();

    // Add all the course properties to FormData
    if (course.title) formData.append('Title', course.title);
    if (course.description) formData.append('Description', course.description);
    // Prefer sending LocationId when provided (numeric foreign key)
    if (course.locationId !== undefined && course.locationId !== null) {
      formData.append('LocationId', course.locationId.toString());
    } else if (typeof course.location === 'string' && course.location) {
      formData.append('Location', course.location);
    }
    if (course.startDate) formData.append('StartDate', course.startDate);
    if (course.endDate) formData.append('EndDate', course.endDate);
    if (course.timeFrom) formData.append('TimeFrom', course.timeFrom);
    if (course.timeTo) formData.append('TimeTo', course.timeTo);
    if (course.availableSeats !== undefined)
      formData.append('AvailableSeats', course.availableSeats.toString());
    if (course.category !== undefined)
      formData.append('Category', course.category.toString());
    if (course.onlineRepeated !== undefined)
      formData.append('OnlineRepeated', course.onlineRepeated.toString());
    if (course.level !== undefined)
      formData.append('Level', course.level.toString());
    if (course.duration) formData.append('Duration', course.duration);
    if (course.price !== undefined)
      formData.append('Price', course.price.toString());
    if (course.kpiWeight !== undefined)
      formData.append('KPIWeight', course.kpiWeight.toString());
    if (course.statusId !== undefined)
      formData.append('StatusId', course.statusId.toString());
    if (course.language) formData.append('Language', course.language);
    if (course.certificate !== undefined)
      formData.append('Certificate', course.certificate.toString());
    if (course.isForAllEmployees !== undefined)
      formData.append('IsForAllEmployees', course.isForAllEmployees.toString());
    if (course.registerationClosedAt)
      formData.append('RegisterationClosedAt', course.registerationClosedAt);

    // Add arrays
    if (course.requirements && course.requirements.length > 0) {
      course.requirements.forEach((req, index) => {
        formData.append(`Requirements[${index}]`, req);
      });
    }

    if (course.learningOutcomes && course.learningOutcomes.length > 0) {
      course.learningOutcomes.forEach((outcome, index) => {
        formData.append(`LearningOutcomes[${index}]`, outcome);
      });
    }

    if (course.targetDepartmentIds && course.targetDepartmentIds.length > 0) {
      course.targetDepartmentIds.forEach((id: number, index: number) => {
        formData.append(`TargetDepartmentIds[${index}]`, id.toString());
      });
    }

    if (course.instructorIds && course.instructorIds.length > 0) {
      course.instructorIds.forEach((id: number, index: number) => {
        formData.append(`InstructorIds[${index}]`, id.toString());
      });
    }

    // Add image file if present
    if (course.imageFile) {
      formData.append('ImageFile', course.imageFile);
      console.log(
        'Image file added to FormData for update:',
        course.imageFile.name,
        course.imageFile.size,
        'bytes'
      );
    } else {
      console.log('No image file to update');
    }

    // Debug: Log FormData contents
    console.log('Update FormData contents:');
    for (let pair of (formData as any).entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    return this.http.put<Course>(`${this.apiUrl}/${id}`, formData);
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

  // Head training approval endpoint
  headApproveRegistration(courseId: number, userId: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${courseId}/registrations/${userId}/head-approve`,
      {}
    );
  }

  // Head training rejection endpoint
  headRejectRegistration(courseId: number, userId: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${courseId}/registrations/${userId}/head-reject`,
      {}
    );
  }

  // Generic registration status update (e.g., main approval without QR)
  updateRegistrationStatus(
    courseId: number,
    userId: number,
    statusId: number
  ): Observable<any> {
    const body = { userId, statusId } as any;
    return this.http.patch(
      `${this.apiUrl}/${courseId}/registrations/${userId}`,
      body
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

  completeCourse(courseId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${courseId}/complete`, {});
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
