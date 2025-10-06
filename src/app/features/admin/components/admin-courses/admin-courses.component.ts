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
  SimpleLocation,
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

  // View mode properties
  viewMode: 'list' | 'calendar' = 'list';
  currentMonth: Date = new Date();
  calendarCourses: { [key: string]: Course[] } = {};

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
  }

  private setupRTLSupport(): void {
    // Wait for translations to be loaded before initializing
    this.translationService.getTranslationsLoaded$().subscribe((loaded) => {
      if (loaded) {
        this.isRTL = this.translationService.isRTL();
        this.initializeFilterOptions(); // Initialize filter options when translations are loaded
        this.loadCourses(); // Load courses after translations are ready
      }
    });

    // Also listen for language changes to reinitialize
    this.translationService.getCurrentLanguage$().subscribe(() => {
      this.isRTL = this.translationService.isRTL();
      this.initializeFilterOptions(); // Reinitialize when language changes
    });
  }

  private initializeFilterOptions(): void {
    this.categories = [
      this.translationService.translate('adminCourses.filters.categoryAll'),
      'OnSite',
      'OutSite',
      'OnlineVideo',
      'Abroad',
    ];

    this.levels = [
      this.translationService.translate('adminCourses.filters.levelAll'),
      this.translationService.translate('adminCourses.level.beginner'),
      this.translationService.translate('adminCourses.level.intermediate'),
      this.translationService.translate('adminCourses.level.advanced'),
    ];

    this.statuses = [
      this.translationService.translate('adminCourses.filters.statusAll'),
      this.translationService.translate('adminCourses.status.draft'),
      this.translationService.translate('adminCourses.status.published'),
      this.translationService.translate('adminCourses.status.archived'),
      this.translationService.translate('adminCourses.status.closed'),
      this.translationService.translate('adminCourses.status.registrationClosed'),
      this.translationService.translate('adminCourses.status.active'),
      this.translationService.translate('adminCourses.status.completed'),
    ];
  }

  private loadCourses(): void {
    // Use filterCourses to load courses with current filter state
    this.filterCourses();
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
      case 3: // Archived
        return 'bg-red-100 text-red-800';
      case 4: // Closed
        return 'bg-gray-100 text-gray-800';
      case 5: // Registration Closed
        return 'bg-yellow-100 text-yellow-800';
      case 6: // Active
        return 'bg-blue-100 text-blue-800';
      case 7: // Completed
        return 'bg-purple-100 text-purple-800';
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
          'adminCourses.status.archived'
        );
      case 4:
        return this.translationService.translate(
          'adminCourses.status.closed'
        );
      case 5:
        return this.translationService.translate(
          'adminCourses.status.registrationClosed'
        );
      case 6:
        return this.translationService.translate(
          'adminCourses.status.active'
        );
      case 7:
        return this.translationService.translate(
          'adminCourses.status.completed'
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
      page: this.currentPage,
      pageSize: this.itemsPerPage,
      sortBy: 'id',
      sortOrder: 'desc',
    };

    // Add search filters
    if (this.searchTerm) {
      filterRequest.title = this.searchTerm;
    }

    // Add category filter
    if (
      this.selectedCategory &&
      this.selectedCategory !==
        this.translationService.translate('adminCourses.filters.categoryAll')
    ) {
      // Map frontend category names to backend enum values
      const categoryMap: { [key: string]: string } = {
        'OnSite': 'OnSite',
        'OutSite': 'OutSite', 
        'OnlineVideo': 'OnlineVideo',
        'Abroad': 'Abroad'
      };
      filterRequest.category = categoryMap[this.selectedCategory] || this.selectedCategory;
    }

    // Add level filter
    if (
      this.selectedLevel &&
      this.selectedLevel !==
        this.translationService.translate('adminCourses.filters.levelAll')
    ) {
      // Map frontend level names to backend enum values
      const levelMap: { [key: string]: string } = {
        [this.translationService.translate('adminCourses.level.beginner')]: 'Beginner',
        [this.translationService.translate(
          'adminCourses.level.intermediate'
        )]: 'Intermediate',
        [this.translationService.translate('adminCourses.level.advanced')]: 'Advanced',
      };
      filterRequest.level = levelMap[this.selectedLevel] || this.selectedLevel;
    }

    // Add status filter
    if (
      this.selectedStatus &&
      this.selectedStatus !==
        this.translationService.translate('adminCourses.filters.statusAll')
    ) {
      // Map frontend status names to backend status IDs
      const statusIndex = this.statuses.indexOf(this.selectedStatus);
      if (statusIndex > 0) { // Skip index 0 which is "All"
        // Map array index to actual status ID
        const statusIdMap = [0, 1, 2, 3, 4, 5, 6, 7]; // 0=All, 1=Draft, 2=Published, 3=Archived, 4=Closed, 5=RegistrationClosed, 6=Active, 7=Completed
        filterRequest.status = statusIdMap[statusIndex];
      }
    }

    this.courseService.filterCourses(filterRequest).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.courses = response.result.items || [];
          this.filteredCourses = [...this.courses];
          this.totalItems = response.result.totalCount || 0;
          this.paginationInfo = {
            currentPage: response.result.page || 1,
            pageSize: response.result.pageSize || 10,
            total: response.result.totalCount || 0,
          };
          this.updatePagination();
          this.updateCalendarCourses();
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
    // Hide publish/unpublish button when course is active (6) or completed (7)
    return course.statusId !== 6 && course.statusId !== 7;
  }

  canCompleteCourse(course: Course): boolean {
    // Show complete button only when course is active (6)
    return course.statusId === 6;
  }

  // Check if course is completed
  isCourseCompleted(course: Course): boolean {
    return course.statusId === 7 || course.statusName === 'Completed';
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
    return course.statusId === 6 || course.statusName === 'Active';
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
          course.statusId = 6;
          course.statusName = 'Active';
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
          course.statusId = 7;
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

  // View mode methods
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'calendar' : 'list';
    if (this.viewMode === 'calendar') {
      this.updateCalendarCourses();
    }
  }

  updateCalendarCourses(): void {
    this.calendarCourses = {};
    this.courses.forEach(course => {
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);
      
      // Add course to all dates between start and end
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = this.formatDateKey(currentDate);
        if (!this.calendarCourses[dateKey]) {
          this.calendarCourses[dateKey] = [];
        }
        this.calendarCourses[dateKey].push(course);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  }

  formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  getCoursesForDate(date: Date): Course[] {
    const dateKey = this.formatDateKey(date);
    return this.calendarCourses[dateKey] || [];
  }

  getCalendarDays(): Date[] {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -startingDayOfWeek + i + 1));
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.updateCalendarCourses();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.updateCalendarCourses();
  }

  getMonthName(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth() && 
           date.getFullYear() === this.currentMonth.getFullYear();
  }

  // Helper method to format date for display
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper method to get location name
  getLocationName(course: Course): string {
    if (!course.location) return 'No Location';
    
    // If location is a string, return it directly
    if (typeof course.location === 'string') {
      return course.location;
    }
    
    // If location is a SimpleLocation object
    const location = course.location as SimpleLocation;
    
    // Check if location has both English and Arabic names
    if (location.nameEn && location.nameAr) {
      return this.isRTL ? location.nameAr : location.nameEn;
    }
    
    // Fallback to available name
    return location.nameEn || location.nameAr || 'Unknown Location';
  }

  // Get course image source with fallback
  getCourseImageSrc(course: Course): string {
    if (!course.image || course.image.trim() === '') {
      return 'assets/images/placeholder.jpg';
    }
    return this.imageBaseUrl + course.image;
  }

  // Handle image loading errors
  onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== 'assets/images/placeholder.jpg') {
      img.src = 'assets/images/placeholder.jpg';
    }
  }
}
