import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import { TranslationService } from '../../../../../locale/translation.service';
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CourseService } from '../../../../core/services/course.service';
import { AiHelperComponent } from '../../../../shared/components/ai-helper/ai-helper.component';
import { QrScannerComponent } from '../../../../shared/components/qr-scanner/qr-scanner.component';

interface CourseResource {
  id: number;
  title: string;
  type: 'video' | 'pdf';
  duration?: string;
  size?: string;
  url: string;
  thumbnail?: string;
  description: string;
  isCompleted: boolean;
}

interface CourseModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  resources: CourseResource[];
  isCompleted: boolean;
  progress: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  location: string;
  locationId?: number;
  templateUrl?: string;
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
  targetDepartments: { id: number; nameEn: string }[];
  instructors: { id: number; nameEn: string; photoUrl: string; bio: string }[];
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

interface Enrollment {
  userId: number;
  fullNameEn: string;
  email: string;
  registerationStatusId: number;
  registerationStatusName: string;
  registeredAt: string;
}

interface Attendance {
  userId: number;
  user: {
    id: number;
    fullNameAr: string;
    fullNameEn: string;
    adUserName: string;
    email: string;
    civilNo: string;
    phoneNumber: string;
    orgRecordId: number;
    createdAt: string;
    createdBy: number;
    isActive: boolean;
    isDeleted: boolean;
  };
  courseId: number;
  dateTime: string;
  attendence: string;
  leave: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
}

interface AttendanceResponse {
  items: Attendance[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    QrScannerComponent,
    AiHelperComponent,
    TranslatePipe,
  ],
})
export class CourseDetailsComponent implements OnInit {
  currentUser: User | null = null;
  course: Course | null = null;
  activeTab = 'overview';
  showAllModules = false;
  enrolled = false;
  loading = false;
  enrollments: Enrollment[] = [];
  enrollmentsLoading = false;
  showQRScanner = false;
  isUserEnrolled = false;
  enrolling = false;
  imageBaseUrl = environment.imageBaseUrl;

  // Attendance properties
  attendances: Attendance[] = [];
  attendancesLoading = false;
  attendancePage = 1;
  attendancePageSize = 10;
  attendanceTotalCount = 0;
  selectedAttendanceDate = '';

  // QR Popup properties
  showAttendanceQRPopup = false;
  attendanceQRData: any = null;
  attendanceQRLoading = false;

  // Course QR Popup properties
  showCourseQRPopup = false;
  courseQRData: any = null;
  courseQRLoading = false;

  // Auto-reload properties
  private qrReloadInterval: any = null;
  private qrCountdownInterval: any = null;
  qrCountdown = 25;
  isAutoReloadEnabled = true;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private toastr: ToastrService,
    private translationService: TranslationService,
    private location: Location
  ) {}

  get isRtl(): boolean {
    return this.translationService.isRTL();
  }

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loading = true;
    this.route.params.subscribe((params) => {
      const courseId = +params['id'];

      // Check if courseId is valid
      if (isNaN(courseId) || courseId <= 0) {
        this.toastr.error('Invalid course ID');
        this.router.navigate(['/courses']);
        this.loading = false;
        return;
      }

      this.courseService.getCourseById(courseId).subscribe({
        next: (response: any) => {
          if (response.statusCode == 200) {
            this.course = this.mapApiCourseToLocal(response.result);
            // Set default attendance date to course start date
            if (this.course.startDate) {
              this.selectedAttendanceDate = new Date(this.course.startDate)
                .toISOString()
                .split('T')[0];
            }
            this.loadEnrollments();
          } else {
            this.toastr.error('Course not found');
            this.router.navigate(['/courses']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading course:', error);
          this.toastr.error('Failed to load course details');
          this.router.navigate(['/courses']);
          this.loading = false;
        },
      });
    });
  }

  // Map API response to local Course interface
  private mapApiCourseToLocal(apiCourse: any): Course {
    return {
      id: apiCourse.id,
      title: apiCourse.title,
      description: apiCourse.description,
      location: apiCourse.location?.nameEn || apiCourse.location || '',
      locationId: apiCourse.locationId,
      templateUrl: apiCourse.location?.templateUrl || apiCourse.templateUrl,
      startDate: apiCourse.startDate,
      endDate: apiCourse.endDate,
      timeFrom: apiCourse.timeFrom,
      timeTo: apiCourse.timeTo,
      availableSeats: apiCourse.availableSeats,
      category: apiCourse.category,
      onlineRepeated: apiCourse.onlineRepeated,
      level: apiCourse.level,
      duration: apiCourse.duration,
      price: apiCourse.price,
      kpiWeight: apiCourse.kpiWeight,
      image: apiCourse.image,
      statusId: apiCourse.statusId,
      statusName: apiCourse.statusName,
      targetDepartments: apiCourse.targetDepartments || [],
      instructors: apiCourse.instructors || [],
      requirements: apiCourse.requirements || [],
      learningOutcomes: apiCourse.learningOutcomes || [],
      lastUpdated: apiCourse.lastUpdated,
      language: apiCourse.language,
      certificate: apiCourse.certificate,
      registerationClosedAt: apiCourse.registerationClosedAt,
      isUserRegistered: apiCourse.isUserRegistered,
      userRegistrationStatusId: apiCourse.userRegistrationStatusId,
      userRegistrationStatusName: apiCourse.userRegistrationStatusName,
    };
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'enrollments') {
      this.loadEnrollments();
    }
    if (tab === 'attendees') {
      this.loadAttendances();
    }
  }

  toggleModules(): void {
    this.showAllModules = !this.showAllModules;
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 4:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-blue-100 text-blue-800';
      case 1:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getLevelColor(level: number): string {
    switch (level) {
      case 3:
        return 'bg-red-100 text-red-800';
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getProgressColor(progress: number): string {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  }

  getResourceIcon(type: string): string {
    return type === 'video' ? 'fas fa-play-circle' : 'fas fa-file-pdf';
  }

  getResourceColor(type: string): string {
    return type === 'video' ? 'text-red-500' : 'text-blue-500';
  }

  getResourceBgColor(type: string): string {
    return type === 'video' ? 'bg-red-50' : 'bg-blue-50';
  }

  getResourceBorderColor(type: string): string {
    return type === 'video' ? 'border-red-200' : 'border-blue-200';
  }

  playResource(resource: CourseResource): void {
    console.log('Playing resource:', resource.title);
    window.open(resource.url, '_blank');
  }

  getTotalResources(): number {
    // 'modules' property does not exist in the new Course model
    return 0;
  }

  getCompletedResources(): number {
    // 'modules' property does not exist in the new Course model
    return 0;
  }

  getTotalDuration(): string {
    // 'modules' property does not exist in the new Course model
    return '0h 0m';
  }

  enrollCourse(): void {
    this.enrolled = true;
    // In a real app, this would make an API call to enroll the user
    console.log('Enrolled in course:', this.course?.title);
  }

  continueLearning(): void {
    console.log('Continuing learning for course:', this.course?.title);
    // Navigate to the first incomplete module or continue from where left off
    this.router.navigate(['/courses', this.course?.id, 'learn']);
  }

  joinCourse(): void {
    console.log('Joining course:', this.course?.title);

    if (!this.currentUser) {
      // Redirect to login if user is not authenticated
      this.router.navigate(['/auth/login']);
      return;
    }

    // Enroll the user in the course
    this.enrolled = true;
    this.course!.statusId = 3; // Assuming 'In Progress' is statusId 3

    // Show success message
    alert(
      `Successfully joined ${this.course?.title}! You can now start learning.`
    );

    // Optionally navigate to the course learning page
    // this.router.navigate(['/courses', this.course?.id, 'learn']);
  }

  getCourseProgress(): number {
    if (!this.course) return 0;

    const totalResources = this.getTotalResources();
    const completedResources = this.getCompletedResources();

    return totalResources > 0
      ? Math.round((completedResources / totalResources) * 100)
      : 0;
  }

  getVisibleModules(): any[] {
    // 'modules' property does not exist in the new Course model
    return [];
  }

  // Add these helper methods to map numeric codes to text
  getLevelText(level: number): string {
    switch (level) {
      case 1:
        return 'Beginner';
      case 2:
        return 'Intermediate';
      case 3:
        return 'Advanced';
      default:
        return 'Unknown';
    }
  }

  getCategoryText(category: number): string {
    switch (category) {
      case 1:
        return 'On Site';
      case 2:
        return 'Online';
      case 3:
        return 'In a Place';
      case 4:
        return 'Abroad';
      default:
        return 'Unknown';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Draft';
      case 2:
        return 'Published';
      case 3:
        return 'In Progress';
      case 4:
        return 'Completed';
      case 5:
        return 'Archived';
      default:
        return 'Unknown';
    }
  }

  loadEnrollments(): void {
    if (!this.course) return;

    this.enrollmentsLoading = true;
    this.courseService.getCourseEnrollments(this.course.id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.enrollments = response.result;
        } else {
          this.enrollments = [];
        }
        this.enrollmentsLoading = false;
      },
      error: (error: any) => {
        this.enrollmentsLoading = false;
        this.toastr.error(error.message);
      },
    });
  }

  // Get user's enrollment status
  getUserEnrollmentStatus(): number | null {
    if (!this.currentUser || !this.course) return null;

    // Use the course-level registration status if available
    if (this.course.isUserRegistered !== undefined) {
      return this.course.userRegistrationStatusId || null;
    }

    // Fallback to searching enrollments (for backward compatibility)
    if (!this.enrollments.length) return null;

    const userEnrollment = this.enrollments.find(
      (enrollment: any) => enrollment.userId === this.currentUser?.id
    );

    return userEnrollment ? userEnrollment.registerationStatusId : null;
  }

  // Check if user can enroll (not enrolled or rejected) and course is published
  canUserEnroll(): boolean {
    if (!this.currentUser || !this.course) return false;

    // Only allow enrollment if course is published
    if (!this.isCoursePublished()) return false;

    // If course has user registration info, use that
    if (this.course.isUserRegistered !== undefined) {
      // Can enroll if not registered or if status is rejected (2)
      return (
        !this.course.isUserRegistered ||
        this.course.userRegistrationStatusId === null
      );
    }

    // Fallback to enrollment array method
    const status = this.getUserEnrollmentStatus();
    // Can enroll if not enrolled (null) or if status is rejected (2)
    return status === null || status === 2;
  }

  enrollInCourse(): void {
    if (!this.course || this.enrolling) return;

    this.enrolling = true;
    this.courseService.registerForCourse(this.course.id).subscribe({
      next: (response: any) => {
        this.enrolling = false;
        if (response.statusCode === 200) {
          this.toastr.success('Successfully registered for the course!');
          this.isUserEnrolled = true;
          // Refresh course data to get updated registration status
          this.refreshCourseData();
        } else {
          this.toastr.error(
            response.message || 'Failed to register for the course'
          );
        }
      },
      error: (error: any) => {
        this.enrolling = false;
        console.error('Error enrolling in course:', error);

        if (error.status === 409) {
          this.toastr.error('You are already registered for this course');
        } else if (error.status === 400) {
          this.toastr.error('Registration is not available for this course');
        } else if (error.status === 404) {
          this.toastr.error('Course not found');
        } else {
          this.toastr.error(
            error.error?.message || 'Failed to register for the course'
          );
        }
      },
    });
  }

  refreshCourseData(): void {
    if (!this.course) return;

    this.courseService.getCourseById(this.course.id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.course = this.mapApiCourseToLocal(response.result);
          // Update attendance date if not already set
          if (this.course.startDate && !this.selectedAttendanceDate) {
            this.selectedAttendanceDate = new Date(this.course.startDate)
              .toISOString()
              .split('T')[0];
          }
        }
      },
      error: (error) => {
        console.error('Error refreshing course data:', error);
      },
    });
  }

  scanQR(): void {
    this.showQRScanner = true;
  }

  onQRScanResult(result: string): void {
    console.log('QR Code scanned:', result);
    this.showQRScanner = false;

    // Handle the QR code result
    this.handleQRCodeResult(result);
  }

  onQRScannerClose(): void {
    this.showQRScanner = false;
  }

  private handleQRCodeResult(qrData: string): void {
    try {
      // Try to parse the QR code data
      const parsedData = JSON.parse(qrData);

      // Handle different types of QR codes
      if (parsedData.type === 'course_enrollment') {
        this.handleCourseEnrollmentQR(parsedData);
      } else if (parsedData.type === 'course_attendance') {
        this.handleCourseAttendanceQR(parsedData);
      } else if (parsedData.type === 'course_info') {
        this.handleCourseInfoQR(parsedData);
      } else {
        // Generic QR code handling
        this.handleGenericQR(qrData);
      }
    } catch (error) {
      // If not JSON, treat as plain text
      this.handleGenericQR(qrData);
    }
  }

  private handleCourseEnrollmentQR(data: any): void {
    if (data.courseId && this.course && data.courseId === this.course.id) {
      alert(`Enrollment QR code scanned for course: ${this.course.title}`);
      // Here you could trigger enrollment process
    } else {
      alert('QR code is for a different course');
    }
  }

  private handleCourseAttendanceQR(data: any): void {
    if (data.courseId && this.course && data.courseId === this.course.id) {
      alert(`Attendance QR code scanned for course: ${this.course.title}`);
      // Here you could trigger attendance marking
    } else {
      alert('QR code is for a different course');
    }
  }

  private handleCourseInfoQR(data: any): void {
    if (data.courseId && this.course && data.courseId === this.course.id) {
      alert(`Course info QR code scanned: ${this.course.title}`);
      // Here you could show additional course information
    } else {
      alert('QR code is for a different course');
    }
  }

  private handleGenericQR(qrData: string): void {
    // Handle plain text QR codes
    if (qrData.includes('http')) {
      // If it's a URL, open it
      window.open(qrData, '_blank');
    } else if (qrData.includes('@') || qrData.includes('mailto:')) {
      // If it's an email
      window.location.href = qrData.startsWith('mailto:')
        ? qrData
        : `mailto:${qrData}`;
    } else if (qrData.startsWith('tel:')) {
      // If it's a phone number
      window.location.href = qrData;
    } else {
      // Display the text content
      alert(`QR Code Content: ${qrData}`);
    }
  }

  // Enrollment Management Methods
  approveEnrollment(userId: number): void {
    if (!this.course) return;

    if (
      confirm(this.translationService.translate('enrollments.confirmApprove'))
    ) {
      this.courseService.approveRegistration(this.course.id, userId).subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(
              this.translationService.translate('enrollments.approvedSuccess')
            );
            this.loadEnrollments(); // Reload enrollments
          } else {
            this.toastr.error(
              response.message ||
                this.translationService.translate('enrollments.approveFailed')
            );
          }
        },
        error: (error: any) => {
          console.error('Error approving enrollment:', error);
          this.toastr.error(
            error.error?.message ||
              this.translationService.translate('enrollments.approveFailed')
          );
        },
      });
    }
  }

  rejectEnrollment(userId: number): void {
    if (!this.course) return;

    if (
      confirm(this.translationService.translate('enrollments.confirmReject'))
    ) {
      this.courseService.rejectRegistration(this.course.id, userId).subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(
              this.translationService.translate('enrollments.rejectedSuccess')
            );
            this.loadEnrollments(); // Reload enrollments
          } else {
            this.toastr.error(
              response.message ||
                this.translationService.translate('enrollments.rejectFailed')
            );
          }
        },
        error: (error: any) => {
          console.error('Error rejecting enrollment:', error);
          this.toastr.error(
            error.error?.message ||
              this.translationService.translate('enrollments.rejectFailed')
          );
        },
      });
    }
  }

  viewEnrollmentDetails(enrollmentId: number): void {
    // TODO: Navigate to enrollment details page or show modal
    console.log('Viewing enrollment details:', enrollmentId);
    alert(`Viewing details for enrollment ID: ${enrollmentId}`);
  }

  // Course Management Methods
  editCourse(): void {
    if (this.course) {
      // Navigate to appropriate edit route based on user role
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/courses/edit', this.course.id]);
      } else if (this.authService.isModerator()) {
        this.router.navigate(['/moderator/courses/edit', this.course.id]);
      }
    }
  }

  publishCourse(): void {
    if (!this.course) return;

    this.courseService.toggleStatus(this.course.id, true).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(
            response.message ||
              this.translationService.translate('courses.publishSuccess')
          );
          // Update the course status locally
          if (this.course) {
            this.course.statusId = 2; // Assuming 'Published' is statusId 2
            this.course.statusName = 'Published';
          }
        } else {
          this.toastr.error(
            response.message ||
              this.translationService.translate('courses.publishFailed')
          );
        }
      },
      error: (error: any) => {
        console.error('Error publishing course:', error);
        this.toastr.error(
          error.error?.message ||
            this.translationService.translate('courses.publishFailed')
        );
      },
    });
  }

  unpublishCourse(): void {
    if (!this.course) return;

    this.courseService.toggleStatus(this.course.id, false).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(
            response.message ||
              this.translationService.translate('courses.unpublishSuccess')
          );
          // Update the course status locally
          if (this.course) {
            this.course.statusId = 1; // Assuming 'Draft' is statusId 1
            this.course.statusName = 'Draft';
          }
        } else {
          this.toastr.error(
            response.message ||
              this.translationService.translate('courses.unpublishFailed')
          );
        }
      },
      error: (error: any) => {
        console.error('Error unpublishing course:', error);
        this.toastr.error(
          error.error?.message ||
            this.translationService.translate('courses.unpublishFailed')
        );
      },
    });
  }

  makeActive(): void {
    if (!this.course) return;

    this.courseService.makeActive(this.course.id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(
            response.message ||
              this.translationService.translate('courses.makeActiveSuccess')
          );
          // Update the course status locally
          if (this.course) {
            this.course.statusId = 3; // Assuming 'In Progress' is statusId 3
            this.course.statusName = 'In Progress';
          }
        } else {
          this.toastr.error(
            response.message ||
              this.translationService.translate('courses.makeActiveFailed')
          );
        }
      },
      error: (error: any) => {
        console.error('Error making course active:', error);
        this.toastr.error(
          error.error?.message ||
            this.translationService.translate('courses.makeActiveFailed')
        );
      },
    });
  }

  completeCourse(): void {
    if (!this.course) return;

    this.courseService.completeCourse(this.course.id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(
            response.message ||
              this.translationService.translate('courses.completeSuccess')
          );
          // Update the course status locally
          if (this.course) {
            this.course.statusId = 4; // Assuming 'Completed' is statusId 4
            this.course.statusName = 'Completed';
          }
        } else {
          this.toastr.error(
            response.message ||
              this.translationService.translate('courses.completeFailed')
          );
        }
      },
      error: (error: any) => {
        console.error('Error completing course:', error);
        this.toastr.error(
          error.error?.message ||
            this.translationService.translate('courses.completeFailed')
        );
      },
    });
  }

  archiveCourse(): void {
    if (!this.course) return;

    this.courseService.archiveCourse(this.course.id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toastr.success(
            this.translationService.translate('courses.archiveSuccess')
          );
          // Update the course status locally
          if (this.course) {
            this.course.statusId = 5; // Assuming 'Archived' is statusId 5
            this.course.statusName = 'Archived';
          }
        } else {
          this.toastr.error(
            response.message ||
              this.translationService.translate('courses.archiveFailed')
          );
        }
      },
      error: (error: any) => {
        console.error('Error archiving course:', error);
        this.toastr.error(
          error.error?.message ||
            this.translationService.translate('courses.archiveFailed')
        );
      },
    });
  }

  // Check if course is published (status = 2)
  isCoursePublished(): boolean {
    return (
      this.course?.statusName === 'Published' || this.course?.statusId === 2
    );
  }

  // Check if course is draft (status = 1)
  isCourseDraft(): boolean {
    return this.course?.statusName === 'Draft';
  }

  // Check if course is archived (status = 5)
  isCourseArchived(): boolean {
    return (
      this.course?.statusName === 'Archived' || this.course?.statusId === 5
    );
  }

  // Check if course can be made active (only published courses can be made active)
  canMakeActive(): boolean {
    return (
      this.course?.statusId === 2 || this.course?.statusName === 'Published'
    );
  }

  // Check if course can be completed (only active courses can be completed)
  canCompleteCourse(): boolean {
    return this.course?.statusId === 3 || this.course?.statusName === 'Active';
  }

  // Check if course is active
  isCourseActive(): boolean {
    return this.course?.statusId === 3 || this.course?.statusName === 'Active';
  }

  // Check if course is completed
  isCourseCompleted(): boolean {
    return (
      this.course?.statusId === 4 || this.course?.statusName === 'Completed'
    );
  }

  // Check if QR buttons should be shown (active status only)
  shouldShowQRButtons(): boolean {
    return this.isCourseActive();
  }

  // Check if edit button should be shown (not completed)
  shouldShowEditButton(): boolean {
    return !this.isCourseCompleted();
  }

  // Check if user can edit course (admin or moderator)
  canEditCourse(): boolean {
    return this.authService.isAdmin() || this.authService.isModerator();
  }

  // Check if user can manage courses (admin or moderator)
  canManageCourses(): boolean {
    return this.authService.isAdmin() || this.authService.isModerator();
  }

  // Check if publish/unpublish buttons should be shown (not completed)
  shouldShowPublishButtons(): boolean {
    return !this.isCourseCompleted();
  }

  // Check if make active button should be shown (not completed)
  shouldShowMakeActiveButton(): boolean {
    return !this.isCourseCompleted() && this.canMakeActive();
  }

  // Check if complete button should be shown (active only)
  shouldShowCompleteButton(): boolean {
    return this.canCompleteCourse();
  }

  getRegisterationClosedAtColor(): string {
    if (
      !this.course ||
      this.course.statusId !== 2 ||
      !this.course.registerationClosedAt
    ) {
      return 'bg-blue-100 text-blue-800';
    }
    const now = new Date();
    const closedAt = new Date(this.course.registerationClosedAt);
    const diffMs = closedAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      return 'bg-red-100 text-red-800';
    } else if (diffDays < 5) {
      return 'bg-orange-100 text-orange-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  }

  getFirstThreeNamesCapitalized(fullName: string): string {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .slice(0, 3)
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
      .join(' ');
  }

  loadAttendances(): void {
    if (!this.course) return;

    this.attendancesLoading = true;
    const date = this.selectedAttendanceDate;
    const page = this.attendancePage;
    const pageSize = this.attendancePageSize;

    this.courseService
      .getCourseAttendances(this.course.id, date, page, pageSize)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.attendances = response.result.items;
            this.attendanceTotalCount = response.result.totalCount;
            this.attendancePage = response.result.page;
            this.attendancePageSize = response.result.pageSize;
          } else {
            this.attendances = [];
          }
          this.attendancesLoading = false;
        },
        error: (error: any) => {
          this.attendancesLoading = false;
          this.toastr.error('Failed to load attendance data');
        },
      });
  }

  onAttendanceDateChange(): void {
    this.attendancePage = 1;
    this.loadAttendances();
  }

  onAttendancePageChange(page: number): void {
    this.attendancePage = page;
    this.loadAttendances();
  }

  getAttendanceStatus(attendance: Attendance): string {
    if (attendance.leave) {
      return 'Completed';
    } else if (attendance.attendence) {
      return 'Present';
    } else {
      return 'Absent';
    }
  }

  getAttendanceStatusColor(attendance: Attendance): string {
    if (attendance.leave) {
      return 'bg-green-100 text-green-800';
    } else if (attendance.attendence) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  }

  getAttendanceDuration(checkIn: string, checkOut: string): string {
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  }

  // Make Math available in template
  Math = Math;

  // Get registration count
  getRegistrationCount(): number {
    return this.enrollments.length;
  }

  // Get registration count text
  getRegistrationCountText(): string {
    const count = this.getRegistrationCount();
    return `${count} student${count !== 1 ? 's' : ''}`;
  }

  showAttendanceQR(): void {
    if (!this.course) return;

    this.showAttendanceQRPopup = true;
    this.attendanceQRLoading = true;
    this.qrCountdown = 25;
    this.isAutoReloadEnabled = true;

    this.loadAttendanceQRData();
    this.startQRAutoReload();
  }

  private loadAttendanceQRData(): void {
    this.courseService.getAttendanceQR(this.course!.id).subscribe({
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

  // Course QR Methods
  showCourseQR(): void {
    if (!this.course) return;

    this.showCourseQRPopup = true;
    this.courseQRLoading = true;
    this.qrCountdown = 25;
    this.isAutoReloadEnabled = true;

    this.loadCourseQRData();
    this.startCourseQRAutoReload();
  }

  private loadCourseQRData(): void {
    this.courseService.getCourseQR(this.course!.id).subscribe({
      next: (response: any) => {
        console.log('Course QR Response:', response);
        this.courseQRData = response;
        this.courseQRLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading course QR:', error);
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
          this.toastr.error('Course QR code not found');
        } else if (error.status === 500) {
          this.toastr.error('Server error: Please try again later');
        } else {
          this.toastr.error(
            `Failed to load course QR: ${error.status} ${error.statusText}`
          );
        }

        this.courseQRLoading = false;
      },
    });
  }

  private startCourseQRAutoReload(): void {
    // Clear any existing intervals
    this.stopCourseQRAutoReload();

    // Start countdown timer
    this.qrCountdownInterval = setInterval(() => {
      this.qrCountdown--;

      if (this.qrCountdown <= 0) {
        this.qrCountdown = 25;
        if (this.isAutoReloadEnabled && this.showCourseQRPopup) {
          this.loadCourseQRData();
        }
      }
    }, 1000);

    // Start auto-reload timer (25 seconds)
    this.qrReloadInterval = setInterval(() => {
      if (this.isAutoReloadEnabled && this.showCourseQRPopup) {
        this.loadCourseQRData();
      }
    }, 25000);
  }

  private stopCourseQRAutoReload(): void {
    if (this.qrReloadInterval) {
      clearInterval(this.qrReloadInterval);
      this.qrReloadInterval = null;
    }
    if (this.qrCountdownInterval) {
      clearInterval(this.qrCountdownInterval);
      this.qrCountdownInterval = null;
    }
  }

  toggleCourseQRAutoReload(): void {
    this.isAutoReloadEnabled = !this.isAutoReloadEnabled;
    if (this.isAutoReloadEnabled) {
      this.qrCountdown = 25;
      this.startCourseQRAutoReload();
    } else {
      this.stopCourseQRAutoReload();
    }
  }

  manualReloadCourseQR(): void {
    this.qrCountdown = 25;
    this.loadCourseQRData();
  }

  closeCourseQRPopup(): void {
    // Stop auto-reload timers
    this.stopCourseQRAutoReload();

    // Clean up blob URL to prevent memory leaks
    if (
      this.courseQRData &&
      this.courseQRData.qrCodeUrl &&
      this.courseQRData.type === 'file'
    ) {
      URL.revokeObjectURL(this.courseQRData.qrCodeUrl);
    }
    this.showCourseQRPopup = false;
    this.courseQRData = null;
  }

  getCourseQRImageSource(): string | null {
    if (!this.courseQRData) return null;

    // Handle file response (blob URL)
    if (this.courseQRData.type === 'file' && this.courseQRData.qrCodeUrl) {
      return this.courseQRData.qrCodeUrl;
    }

    // Check for different possible QR code formats
    if (this.courseQRData.qrCodeUrl) {
      return this.courseQRData.qrCodeUrl;
    }

    if (this.courseQRData.qrCode) {
      // If it's a base64 string, add the data URL prefix
      if (this.courseQRData.qrCode.startsWith('data:image')) {
        return this.courseQRData.qrCode;
      }
      if (
        this.courseQRData.qrCode.startsWith('/9j/') ||
        this.courseQRData.qrCode.startsWith('iVBORw0KGgo')
      ) {
        return `data:image/png;base64,${this.courseQRData.qrCode}`;
      }
      return this.courseQRData.qrCode;
    }

    if (this.courseQRData.data) {
      // Handle text response type
      if (this.courseQRData.type === 'text') {
        const data = this.courseQRData.data;
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

  onCourseQRImageError(event: any): void {
    console.error('Course QR image failed to load:', event);
    this.toastr.error('Failed to load course QR code image');
  }

  // Get template download URL
  getTemplateDownloadUrl(): string | null {
    if (!this.course?.templateUrl) return null;
    return `${this.imageBaseUrl}${this.course.templateUrl}`;
  }

  // Download template
  downloadTemplate(): void {
    const templateUrl = this.getTemplateDownloadUrl();
    if (templateUrl) {
      window.open(templateUrl, '_blank');
    }
  }
}
