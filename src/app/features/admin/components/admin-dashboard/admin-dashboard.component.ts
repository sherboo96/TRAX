import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User, UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats = {
    totalCourses: 0,
    totalInstructors: 0,
    totalInstitutions: 0,
    totalUsers: 0,
    pendingRequests: 0,
  };

  upcomingCourses: any[] = [];
  topCourses: any[] = [];
  recentAttendees: any[] = [];
  enrollmentRequests: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadStats();
    this.loadUpcomingCourses();
    this.loadTopCourses();
    this.loadRecentAttendees();
    this.loadEnrollmentRequests();
  }

  private loadStats(): void {
    // Mock data for now - replace with actual API calls
    this.stats = {
      totalCourses: 25,
      totalInstructors: 15,
      totalInstitutions: 8,
      totalUsers: 150,
      pendingRequests: 12,
    };
  }

  private loadUpcomingCourses(): void {
    // Mock data for upcoming courses
    this.upcomingCourses = [
      {
        title: 'Advanced Angular Development',
        instructor: 'Dr. Ahmed Al-Sabah',
        startDate: 'Dec 15, 2024',
        enrolledCount: 45,
      },
      {
        title: 'React Fundamentals',
        instructor: 'Prof. Fatima Al-Rashid',
        startDate: 'Dec 18, 2024',
        enrolledCount: 38,
      },
      {
        title: 'Node.js Backend Development',
        instructor: 'Eng. Mohammed Al-Khalil',
        startDate: 'Dec 20, 2024',
        enrolledCount: 32,
      },
      {
        title: 'UI/UX Design Principles',
        instructor: 'Ms. Sara Al-Mansouri',
        startDate: 'Dec 22, 2024',
        enrolledCount: 28,
      },
    ];
  }

  private loadTopCourses(): void {
    // Mock data for top courses with enrollment percentages
    this.topCourses = [
      {
        title: 'Angular Development',
        enrolledCount: 156,
        percentage: 85,
      },
      {
        title: 'React Fundamentals',
        enrolledCount: 142,
        percentage: 78,
      },
      {
        title: 'Node.js Backend',
        enrolledCount: 98,
        percentage: 65,
      },
      {
        title: 'UI/UX Design',
        enrolledCount: 87,
        percentage: 58,
      },
      {
        title: 'Database Management',
        enrolledCount: 76,
        percentage: 52,
      },
    ];
  }

  private loadRecentAttendees(): void {
    // Mock data for recent course attendees
    this.recentAttendees = [
      {
        name: 'Ahmed Al-Sabah',
        course: 'Advanced Angular Development',
        completionDate: 'Dec 10, 2024',
        status: 'Completed',
      },
      {
        name: 'Fatima Al-Rashid',
        course: 'React Fundamentals',
        completionDate: 'Dec 8, 2024',
        status: 'Completed',
      },
      {
        name: 'Mohammed Al-Khalil',
        course: 'Node.js Backend Development',
        completionDate: 'Dec 5, 2024',
        status: 'In Progress',
      },
      {
        name: 'Sara Al-Mansouri',
        course: 'UI/UX Design Principles',
        completionDate: 'Dec 3, 2024',
        status: 'Completed',
      },
      {
        name: 'Khalid Al-Zahra',
        course: 'Database Management',
        completionDate: 'Dec 1, 2024',
        status: 'Completed',
      },
    ];
  }

  private loadEnrollmentRequests(): void {
    // Mock data for enrollment requests
    this.enrollmentRequests = [
      {
        name: 'Ali Al-Mutairi',
        course: 'Advanced Angular Development',
        requestDate: 'Dec 12, 2024',
      },
      {
        name: 'Noura Al-Salem',
        course: 'React Fundamentals',
        requestDate: 'Dec 11, 2024',
      },
      {
        name: 'Abdullah Al-Qahtani',
        course: 'Node.js Backend Development',
        requestDate: 'Dec 10, 2024',
      },
      {
        name: 'Mariam Al-Hajri',
        course: 'UI/UX Design Principles',
        requestDate: 'Dec 9, 2024',
      },
      {
        name: 'Omar Al-Suwaidi',
        course: 'Database Management',
        requestDate: 'Dec 8, 2024',
      },
    ];
  }

  get isAdmin(): boolean {
    return this.currentUser?.roleId === UserRole.ADMIN;
  }
}
