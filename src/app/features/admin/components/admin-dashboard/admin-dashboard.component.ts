import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User, UserRole } from '../../../../core/models/user.model';
import { TranslationService } from '../../../../../locale/translation.service';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import {
  DashboardService,
  DashboardStats,
  TopCourse,
  RecentAttendee,
  ChartData,
  CourseKpi,
  DepartmentKpi,
} from '../../../../core/services/dashboard.service';
import { BaseResponse } from '../../../../core/models/base-response.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  isRTL = false;
  loading = false;
  error: string | null = null;

  stats: DashboardStats = {
    totalCourses: 0,
    totalInstructors: 0,
    totalInstitutions: 0,
    totalUsers: 0,
    pendingRequests: 0,
  };

  topCourses: TopCourse[] = [];
  recentAttendees: RecentAttendee[] = [];

  // Chart data
  courseKpisChart: ChartData<CourseKpi> | null = null;
  departmentKpisChart: ChartData<DepartmentKpi> | null = null;

  constructor(
    private authService: AuthService,
    public translationService: TranslationService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.setupRTLSupport();
    this.loadStats();
    this.loadTopCourses();
    this.loadRecentAttendees();
    this.loadCourseKpisChart();
    this.loadDepartmentKpisChart();
  }

  private setupRTLSupport(): void {
    this.translationService.getCurrentLanguage$().subscribe(() => {
      this.isRTL = this.translationService.isRTL();
    });
  }

  private loadStats(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboardStats().subscribe({
      next: (response: BaseResponse<DashboardStats>) => {
        if (response.statusCode === 200 && response.result) {
          this.stats = response.result;
        } else {
          this.error =
            response.message || 'Failed to load dashboard statistics';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard statistics';
        this.loading = false;
        console.error('Error loading dashboard stats:', error);
      },
    });
  }

  private loadTopCourses(): void {
    this.dashboardService.getTopCourses(5).subscribe({
      next: (response: BaseResponse<TopCourse[]>) => {
        if (response.statusCode === 200 && response.result) {
          this.topCourses = response.result;
        } else {
          console.error('Failed to load top courses:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading top courses:', error);
      },
    });
  }

  private loadRecentAttendees(): void {
    this.dashboardService.getRecentAttendees(5).subscribe({
      next: (response: BaseResponse<RecentAttendee[]>) => {
        if (response.statusCode === 200 && response.result) {
          this.recentAttendees = response.result;
        } else {
          console.error('Failed to load recent attendees:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading recent attendees:', error);
      },
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.roleId === UserRole.ADMIN;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getEnrollmentPercentage(enrolledCount: number, maxCapacity: number): number {
    if (maxCapacity === 0) return 0;
    return Math.round((enrolledCount / maxCapacity) * 100);
  }

  private loadCourseKpisChart(): void {
    this.dashboardService.getCourseKpisChart(10).subscribe({
      next: (response: BaseResponse<ChartData<CourseKpi>>) => {
        if (response.statusCode === 200 && response.result) {
          this.courseKpisChart = response.result;
        } else {
          console.error('Failed to load course KPIs chart:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading course KPIs chart:', error);
      },
    });
  }

  private loadDepartmentKpisChart(): void {
    this.dashboardService.getDepartmentKpisChart(10).subscribe({
      next: (response: BaseResponse<ChartData<DepartmentKpi>>) => {
        if (response.statusCode === 200 && response.result) {
          this.departmentKpisChart = response.result;
        } else {
          console.error(
            'Failed to load department KPIs chart:',
            response.message
          );
        }
      },
      error: (error) => {
        console.error('Error loading department KPIs chart:', error);
      },
    });
  }
}
