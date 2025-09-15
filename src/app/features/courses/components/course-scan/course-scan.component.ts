import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../../core/services/course.service';
import { ToastrService } from 'ngx-toastr';

interface AttendanceResponse {
  statusCode: number;
  success: boolean;
  message: string;
  result?: {
    id: number;
    userId: number;
    courseId: number;
    dateTime: string;
    attendence: string;
    leave: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
  };
}

@Component({
  selector: 'app-course-scan',
  templateUrl: './course-scan.component.html',
  styleUrls: ['./course-scan.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class CourseScanComponent implements OnInit {
  courseId: string = '';
  token: string = '';
  loading = true;
  scanResult: 'success' | 'error' | null = null;
  attendanceData: any = null;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.courseId = params['id'];
      this.token = params['token'] || '';
    });

    this.route.queryParams.subscribe((queryParams) => {
      this.token = queryParams['token'] || this.token;
    });

    if (this.courseId && this.token) {
      this.scanAttendance();
    } else {
      this.toastr.error('Invalid course ID or token');
    }
  }

  private scanAttendance(): void {
    this.loading = true;
    this.scanResult = null;
    this.attendanceData = null;
    this.errorMessage = '';

    this.courseService.scanAttendance(this.courseId, this.token).subscribe({
      next: (response: AttendanceResponse) => {
        this.loading = false;

        if (response.statusCode === 200) {
          this.scanResult = 'success';
          this.attendanceData = response.result;
          this.toastr.success('Attendance recorded successfully!');
        } else {
          this.scanResult = 'error';
          this.errorMessage = response.message || 'Failed to record attendance';
          this.toastr.error(this.errorMessage);
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.scanResult = 'error';

        if (error.status === 404 || error.status === 401) {
          this.errorMessage = 'Course or token not found';
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid token or course ID';
        } else if (error.status === 409) {
          this.errorMessage = 'Attendance already recorded for this session';
        } else if (error.status === 0) {
          this.errorMessage = 'Network error: Unable to connect to server';
        } else {
          this.errorMessage =
            error.error?.message ||
            'Failed to record attendance. Please contact your team for help.';
        }

        this.toastr.error(this.errorMessage);
      },
    });
  }

  getAttendanceTime(): string {
    if (!this.attendanceData?.dateTime) return '';

    const date = new Date(this.attendanceData.dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  getAttendanceDate(): string {
    if (!this.attendanceData?.dateTime) return '';

    const date = new Date(this.attendanceData.dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  retry(): void {
    this.scanAttendance();
  }
}
