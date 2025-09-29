import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import { TranslationService } from '../../../../../locale/translation.service';
import { User, UserRole } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import {
  Course,
  CourseFilterRequest,
  CourseService,
} from '../../../../core/services/course.service';
import { AiHelperComponent } from '../../../../shared/components/ai-helper/ai-helper.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-courses',
  templateUrl: './admin-courses.component.html',
  styleUrls: ['./admin-courses.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    AiHelperComponent,
    PaginationComponent,
    TranslatePipe,
  ],
})
export class AdminCoursesComponent implements OnInit {
  currentUser: User | null = null;
  isRTL = false;
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  loading = false;
  imageBaseUrl = environment.imageBaseUrl;
  // Search and filter properties
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedLevel: string = '';
  selectedStatus: string = '';
  isSearchExpanded: boolean = false;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  paginationInfo = {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  };

  // QR Popup properties
  showAttendanceQRPopup = false;
  attendanceQRData: any = null;
  attendanceQRLoading = false;
  selectedCourseForQR: Course | null = null;

  // Auto-reload properties
  private qrReloadInterval: any = null;
  private qrCountdownInterval: any = null;
  qrCountdown = 25;
  isAutoReloadEnabled = true;

  // Filter options
  categories: string[] = [];
  levels: string[] = [];
  statuses: string[] = [];

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router,
    private toastr: ToastrService,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.setupRTLSupport();
    this.initializeFilterOptions();
    this.loadCourses();
  }

  private setupRTLSupport(): void {
    this.translationService.getCurrentLanguage$().subscribe(() => {
      this.isRTL = this.translationService.isRTL();
      this.initializeFilterOptions(); // Reinitialize filter options when language changes
    });
  }

  private initializeFilterOptions(): void {
    this.categories = [
      this.translationService.translate('adminCourses.filters.category') +
        ' - All',
      'Technology',
      'Business',
      'Design',
      'Marketing',
      'Development',
    ];

    this.levels = [
      this.translationService.translate('adminCourses.filters.level') +
        ' - All',
      this.translationService.translate('adminCourses.level.beginner'),
      this.translationService.translate('adminCourses.level.intermediate'),
      this.translationService.translate('adminCourses.level.advanced'),
    ];

    this.statuses = [
      this.translationService.translate('adminCourses.filters.status') +
        ' - All',
      this.translationService.translate('adminCourses.status.draft'),
      this.translationService.translate('adminCourses.status.published'),
      this.translationService.translate('adminCourses.status.inProgress'),
      this.translationService.translate('adminCourses.status.completed'),
      this.translationService.translate('adminCourses.status.archived'),
    ];
  }

  private loadCourses(): void {
    this.loading = true;

    const filterRequest: CourseFilterRequest = {
      page: this.currentPage, // API uses 0-based pagination
      pageSize: this.itemsPerPage,
      sortBy: 'id',
      sortOrder: 'desc',
    };

    this.courseService.filterCourses(filterRequest).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.courses = response.result;
          this.filteredCourses = [...this.courses];
          // this.totalItems = response.pagination.total;
          // this.currentPage = response.pagination.currentPage;
          // this.paginationInfo = {
          //   currentPage: response.pagination.currentPage,
          //   pageSize: response.pagination.pageSize,
          //   total: response.pagination.total,
          // };
          this.updatePagination();
        } else {
          console.error('Failed to load courses:', response.message);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      },
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.userType === UserRole.ADMIN;
  }

  get isModerator(): boolean {
    return (
      this.currentUser?.userType === UserRole.MODERATOR ||
      this.currentUser?.userType === UserRole.MODERATOR_TYPE_3
    );
  }

  addCourse(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/courses/add']);
    } else if (this.isModerator) {
      this.router.navigate(['/moderator/courses/add']);
    }
  }

  toggleSearchFilters(): void {
    this.isSearchExpanded = !this.isSearchExpanded;
  }

  editCourse(courseId: number): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/courses/edit', courseId]);
    } else if (this.isModerator) {
      this.router.navigate(['/moderator/courses/edit', courseId]);
    }
  }

  deleteCourse(courseId: number): void {
    // Implement delete course functionality
    console.log('Delete course:', courseId);
  }

  // Navigation method
  navigateToCourseDetails(course: Course): void {
    if (course && course.id) {
      if (this.isAdmin) {
        this.router.navigate(['/admin/courses', course.id]);
      } else if (this.isModerator) {
        this.router.navigate(['/moderator/courses', course.id]);
      }
    }
  }

  // Status color helper
  getStatusColor(status: number): string {
    switch (status) {
      case 1: // Draft
        return 'bg-gray-100 text-gray-800';
      case 2: // Published
        return 'bg-green-100 text-green-800';
      case 3: // In Progress
        return 'bg-blue-100 text-blue-800';
      case 4: // Completed
        return 'bg-purple-100 text-purple-800';
      case 5: // Archived
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Get status text
  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return this.translationService.translate('adminCourses.status.draft');
      case 2:
        return this.translationService.translate(
          'adminCourses.status.published'
        );
      case 3:
        return this.translationService.translate(
          'adminCourses.status.inProgress'
        );
      case 4:
        return this.translationService.translate(
          'adminCourses.status.completed'
        );
      case 5:
        return this.translationService.translate(
          'adminCourses.status.archived'
        );
      default:
        return 'Unknown';
    }
  }

  // Level color helper
  getLevelColor(level: number): string {
    switch (level) {
      case 1: // Beginner
        return 'bg-green-100 text-green-800';
      case 2: // Intermediate
        return 'bg-yellow-100 text-yellow-800';
      case 3: // Advanced
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Get level text
  getLevelText(level: number): string {
    switch (level) {
      case 1:
        return this.translationService.translate('adminCourses.level.beginner');
      case 2:
        return this.translationService.translate(
          'adminCourses.level.intermediate'
        );
      case 3:
        return this.translationService.translate('adminCourses.level.advanced');
      default:
        return 'Unknown';
    }
  }

  // Progress color helper
  getProgressColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  // Resource counting helpers
  getTotalResources(course: Course): number {
    // 'modules' property does not exist in the new Course model
    return 0;
  }

  getCompletedResources(course: Course): number {
    // 'modules' property does not exist in the new Course model
    return 0;
  }

  // Filter courses based on search and filters
  filterCourses(): void {
    this.loading = true;

    const filterRequest: CourseFilterRequest = {
      page: this.currentPage - 1, // API uses 0-based pagination
      pageSize: this.itemsPerPage,
      sortBy: 'title',
      sortOrder: 'asc',
    };

    // Add search filters
    if (this.searchTerm) {
      filterRequest.title = this.searchTerm;
      filterRequest.description = this.searchTerm;
    }

    // Add category filter
    if (this.selectedCategory && !this.selectedCategory.includes('All')) {
      const categoryMap: { [key: string]: number } = {
        Technology: 1,
        Business: 2,
        Design: 3,
        Marketing: 4,
        Development: 5,
      };
      filterRequest.category = categoryMap[this.selectedCategory];
    }

    // Add level filter
    if (this.selectedLevel && !this.selectedLevel.includes('All')) {
      const levelMap: { [key: string]: number } = {
        [this.translationService.translate('adminCourses.level.beginner')]: 1,
        [this.translationService.translate(
          'adminCourses.level.intermediate'
        )]: 2,
        [this.translationService.translate('adminCourses.level.advanced')]: 3,
      };
      filterRequest.level = levelMap[this.selectedLevel];
    }

    // Add status filter
    if (this.selectedStatus && !this.selectedStatus.includes('All')) {
      const statusMap: { [key: string]: number } = {
        [this.translationService.translate('adminCourses.status.draft')]: 1,
        [this.translationService.translate('adminCourses.status.published')]: 2,
        [this.translationService.translate(
          'adminCourses.status.inProgress'
        )]: 3,
        [this.translationService.translate('adminCourses.status.completed')]: 4,
        [this.translationService.translate('adminCourses.status.archived')]: 5,
      };
      filterRequest.status = statusMap[this.selectedStatus];
    }

    this.courseService.filterCourses(filterRequest).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.courses = response.result;
          this.filteredCourses = [...this.courses];
          this.totalItems = response.pagination.total;
          this.currentPage = response.pagination.currentPage;
          this.paginationInfo = {
            currentPage: response.pagination.currentPage,
            pageSize: response.pagination.pageSize,
            total: response.pagination.total,
          };
          this.updatePagination();
        } else {
          console.error('Failed to filter courses:', response.message);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error filtering courses:', error);
        this.loading = false;
      },
    });
  }

  // Search method with debouncing
  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.filterCourses();
  }

  // Category filter change
  onCategoryChange(): void {
    this.currentPage = 1;
    this.filterCourses();
  }

  // Level filter change
  onLevelChange(): void {
    this.currentPage = 1;
    this.filterCourses();
  }

  // Status filter change
  onStatusChange(): void {
    this.currentPage = 1;
    this.filterCourses();
  }

  // Clear all filters
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedLevel = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.filterCourses();
  }

  // Pagination methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.currentPage = Math.max(1, this.currentPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.filterCourses();
  }

  onPageSizeChange(newPageSize: number): void {
    this.itemsPerPage = newPageSize;
    this.currentPage = 1;
    this.filterCourses();
  }

  getPaginatedCourses(): Course[] {
    return this.filteredCourses;
  }

  canMakeActive(course: Course): boolean {
    return course.statusId === 2 || course.statusName === 'Published';
  }

  canTogglePublishStatus(course: Course): boolean {
    // Hide publish/unpublish button when course is active (3) or completed (4)
    return course.statusId !== 3 && course.statusId !== 4;
  }

  canCompleteCourse(course: Course): boolean {
    // Show complete button only when course is active (3)
    return course.statusId === 3;
  }

  // Check if course is completed
  isCourseCompleted(course: Course): boolean {
    return course.statusId === 4 || course.statusName === 'Completed';
  }

  // Check if edit button should be shown (not completed)
  shouldShowEditButton(course: Course): boolean {
    return !this.isCourseCompleted(course);
  }

  // Check if publish/unpublish buttons should be shown (not completed)
  shouldShowPublishButtons(course: Course): boolean {
    return !this.isCourseCompleted(course);
  }

  // Check if make active button should be shown (not completed)
  shouldShowMakeActiveButton(course: Course): boolean {
    return !this.isCourseCompleted(course) && this.canMakeActive(course);
  }

  // Check if complete button should be shown (active only)
  shouldShowCompleteButton(course: Course): boolean {
    return this.canCompleteCourse(course);
  }

  // Check if QR buttons should be shown (active status only)
  shouldShowQRButtons(course: Course): boolean {
    return course.statusId === 3 || course.statusName === 'In Progress';
  }

  toggleCourseStatus(course: Course): void {
    if (!course) return;

    const isCurrentlyPublished =
      course.statusId === 2 || course.statusName === 'Published';
    const newPublishState = !isCurrentlyPublished;

    this.courseService.toggleStatus(course.id, newPublishState).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          // Update the course status locally
          if (newPublishState) {
            course.statusId = 2;
            course.statusName = 'Published';
          } else {
            course.statusId = 1;
            course.statusName = 'Draft';
          }
          this.toastr.success(
            response.message || 'Course status updated successfully!'
          );
        } else {
          this.toastr.error(
            'Failed to update course status:',
            response.message
          );
        }
      },
      error: (error: any) => {
        this.toastr.error('Error updating course status:', error);
      },
    });
  }

  makeCourseActive(course: Course): void {
    if (!course) return;

    this.courseService.makeActive(course.id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          // Update the course status locally
          course.statusId = 3;
          course.statusName = 'In Progress';
          this.toastr.success(
            response.message || 'Course made active successfully!'
          );
        } else {
          this.toastr.error('Failed to make course active:', response.message);
        }
      },
      error: (error: any) => {
        this.toastr.error('Error making course active:', error);
      },
    });
  }

  completeCourse(course: Course): void {
    if (!course) return;

    this.courseService.completeCourse(course.id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          // Update the course status locally
          course.statusId = 4;
          course.statusName = 'Completed';
          this.toastr.success(
            response.message || 'Course completed successfully!'
          );
        } else {
          this.toastr.error('Failed to complete course:', response.message);
        }
      },
      error: (error: any) => {
        this.toastr.error('Error completing course:', error);
      },
    });
  }

  showAttendanceQR(course: Course): void {
    if (!course) return;

    this.selectedCourseForQR = course;
    this.showAttendanceQRPopup = true;
    this.attendanceQRLoading = true;
    this.qrCountdown = 25;
    this.isAutoReloadEnabled = true;

    this.loadAttendanceQRData();
    this.startQRAutoReload();
  }

  private loadAttendanceQRData(): void {
    if (!this.selectedCourseForQR) return;

    this.courseService.getAttendanceQR(this.selectedCourseForQR.id).subscribe({
      next: (response: any) => {
        console.log('QR Response:', response);
        this.attendanceQRData = response;
        this.attendanceQRLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading attendance QR:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error,
        });

        // Handle different error scenarios
        if (error.status === 0) {
          this.toastr.error('Network error: Unable to connect to server');
        } else if (error.status === 404) {
          this.toastr.error('QR code not found for this course');
        } else if (error.status === 500) {
          this.toastr.error('Server error: Please try again later');
        } else {
          this.toastr.error(
            `Failed to load attendance QR: ${error.status} ${error.statusText}`
          );
        }

        this.attendanceQRLoading = false;
      },
    });
  }

  private startQRAutoReload(): void {
    // Clear any existing intervals
    this.stopQRAutoReload();

    // Start countdown timer
    this.qrCountdownInterval = setInterval(() => {
      this.qrCountdown--;

      if (this.qrCountdown <= 0) {
        this.qrCountdown = 25;
        if (this.isAutoReloadEnabled && this.showAttendanceQRPopup) {
          this.loadAttendanceQRData();
        }
      }
    }, 1000);

    // Start auto-reload timer (25 seconds)
    this.qrReloadInterval = setInterval(() => {
      if (this.isAutoReloadEnabled && this.showAttendanceQRPopup) {
        this.loadAttendanceQRData();
      }
    }, 25000);
  }

  private stopQRAutoReload(): void {
    if (this.qrReloadInterval) {
      clearInterval(this.qrReloadInterval);
      this.qrReloadInterval = null;
    }
    if (this.qrCountdownInterval) {
      clearInterval(this.qrCountdownInterval);
      this.qrCountdownInterval = null;
    }
  }

  toggleQRAutoReload(): void {
    this.isAutoReloadEnabled = !this.isAutoReloadEnabled;
    if (this.isAutoReloadEnabled) {
      this.qrCountdown = 25;
      this.startQRAutoReload();
    } else {
      this.stopQRAutoReload();
    }
  }

  manualReloadQR(): void {
    this.qrCountdown = 25;
    this.loadAttendanceQRData();
  }

  closeAttendanceQRPopup(): void {
    // Stop auto-reload timers
    this.stopQRAutoReload();

    // Clean up blob URL to prevent memory leaks
    if (
      this.attendanceQRData &&
      this.attendanceQRData.qrCodeUrl &&
      this.attendanceQRData.type === 'file'
    ) {
      URL.revokeObjectURL(this.attendanceQRData.qrCodeUrl);
    }
    this.showAttendanceQRPopup = false;
    this.attendanceQRData = null;
    this.selectedCourseForQR = null;
  }

  getQRImageSource(): string | null {
    if (!this.attendanceQRData) return null;

    // Handle file response (blob URL)
    if (
      this.attendanceQRData.type === 'file' &&
      this.attendanceQRData.qrCodeUrl
    ) {
      return this.attendanceQRData.qrCodeUrl;
    }

    // Check for different possible QR code formats
    if (this.attendanceQRData.qrCodeUrl) {
      return this.attendanceQRData.qrCodeUrl;
    }

    if (this.attendanceQRData.qrCode) {
      // If it's a base64 string, add the data URL prefix
      if (this.attendanceQRData.qrCode.startsWith('data:image')) {
        return this.attendanceQRData.qrCode;
      }
      if (
        this.attendanceQRData.qrCode.startsWith('/9j/') ||
        this.attendanceQRData.qrCode.startsWith('iVBORw0KGgo')
      ) {
        return `data:image/png;base64,${this.attendanceQRData.qrCode}`;
      }
      return this.attendanceQRData.qrCode;
    }

    if (this.attendanceQRData.data) {
      // Handle text response type
      if (this.attendanceQRData.type === 'text') {
        const data = this.attendanceQRData.data;
        if (data.startsWith('data:image')) {
          return data;
        }
        if (data.startsWith('/9j/') || data.startsWith('iVBORw0KGgo')) {
          return `data:image/png;base64,${data}`;
        }
        // If it's a URL
        if (data.startsWith('http')) {
          return data;
        }
      }
    }

    return null;
  }

  onQRImageError(event: any): void {
    console.error('QR image failed to load:', event);
    this.toastr.error('Failed to load QR code image');
  }
}
