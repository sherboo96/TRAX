import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseResponse } from '../models/base-response.model';

export interface DashboardStats {
  totalCourses: number;
  totalInstructors: number;
  totalInstitutions: number;
  totalUsers: number;
  pendingRequests: number;
}

export interface UpcomingCourse {
  id: number;
  title: string;
  instructor: string;
  startDate: string;
  enrolledCount: number;
  maxCapacity: number;
}

export interface TopCourse {
  id: number;
  title: string;
  enrolledCount: number;
  percentage: number;
}

export interface RecentAttendee {
  id: number;
  name: string;
  course: string;
  completionDate: string;
  status: string;
}

export interface EnrollmentRequest {
  id: number;
  name: string;
  course: string;
  requestDate: string;
  status: string;
}

export interface ChartData<T> {
  data: T[];
  chartType: string;
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
}

export interface CourseKpi {
  courseId: number;
  courseTitle: string;
  totalEnrollments: number;
  completedEnrollments: number;
  pendingEnrollments: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
  totalHours: number;
  lastUpdated: string;
}

export interface DepartmentKpi {
  departmentId: number;
  departmentName: string;
  totalCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
  totalHours: number;
  activeUsers: number;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<BaseResponse<DashboardStats>> {
    return this.http.get<BaseResponse<DashboardStats>>(`${this.apiUrl}/stats`);
  }

  getUpcomingCourses(
    count: number = 5
  ): Observable<BaseResponse<UpcomingCourse[]>> {
    return this.http.get<BaseResponse<UpcomingCourse[]>>(
      `${this.apiUrl}/upcoming-courses?count=${count}`
    );
  }

  getTopCourses(count: number = 5): Observable<BaseResponse<TopCourse[]>> {
    return this.http.get<BaseResponse<TopCourse[]>>(
      `${this.apiUrl}/top-courses?count=${count}`
    );
  }

  getRecentAttendees(
    count: number = 5
  ): Observable<BaseResponse<RecentAttendee[]>> {
    return this.http.get<BaseResponse<RecentAttendee[]>>(
      `${this.apiUrl}/recent-attendees?count=${count}`
    );
  }

  getEnrollmentRequests(
    count: number = 5
  ): Observable<BaseResponse<EnrollmentRequest[]>> {
    return this.http.get<BaseResponse<EnrollmentRequest[]>>(
      `${this.apiUrl}/enrollment-requests?count=${count}`
    );
  }

  getCourseKpisChart(
    topCount: number = 10
  ): Observable<BaseResponse<ChartData<CourseKpi>>> {
    return this.http.get<BaseResponse<ChartData<CourseKpi>>>(
      `${this.apiUrl}/charts/course-kpis?topCount=${topCount}`
    );
  }

  getDepartmentKpisChart(
    topCount: number = 10
  ): Observable<BaseResponse<ChartData<DepartmentKpi>>> {
    return this.http.get<BaseResponse<ChartData<DepartmentKpi>>>(
      `${this.apiUrl}/charts/department-kpis?topCount=${topCount}`
    );
  }
}
