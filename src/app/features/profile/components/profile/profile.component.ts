import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

interface ProfileData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    civilNumber: string;
    address: string;
    city: string;
    country: string;
  };
  professionalInfo: {
    department: string;
    position: string;
    employeeId: string;
    hireDate: string;
    supervisor: string;
    workLocation: string;
    skills: string[];
    certifications: string[];
  };
  learningStats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalHours: number;
    certificates: number;
    averageScore: number;
    learningStreak: number;
    lastActive: string;
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      courseUpdates: boolean;
      achievementAlerts: boolean;
    };
  };
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isEditing = false;
  activeTab = 'personal';

  profileData: ProfileData = {
    personalInfo: {
      fullName:
        this.currentUser?.fullNameEn || this.currentUser?.fullNameAr || 'User',
      email: this.currentUser?.email || '',
      phone: this.currentUser?.phoneNumber || '',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      nationality: 'Kuwaiti',
      civilNumber: this.currentUser?.civilNo || '',
      address: 'Block 5, Street 12, House 45',
      city: 'Kuwait City',
      country: 'Kuwait',
    },
    professionalInfo: {
      department: 'Information Technology',
      position: 'Senior Software Developer',
      employeeId: 'IT-2023-001',
      hireDate: '2020-06-15',
      supervisor: 'Dr. Fatima Al-Zahra',
      workLocation: 'Main Office - Floor 3',
      skills: [
        'Angular',
        'TypeScript',
        'JavaScript',
        'HTML/CSS',
        'Node.js',
        'Python',
        'SQL',
        'Git',
        'Docker',
        'AWS',
      ],
      certifications: [
        'AWS Certified Solutions Architect',
        'Microsoft Certified: Azure Developer',
        'Certified Scrum Master (CSM)',
        'ITIL Foundation Certificate',
      ],
    },
    learningStats: {
      totalCourses: 24,
      completedCourses: 18,
      inProgressCourses: 4,
      totalHours: 156,
      certificates: 12,
      averageScore: 87,
      learningStreak: 15,
      lastActive: '2024-01-15T10:30:00Z',
    },
    preferences: {
      language: 'English',
      timezone: 'Asia/Kuwait',
      notifications: {
        email: true,
        sms: false,
        push: true,
        courseUpdates: true,
        achievementAlerts: true,
      },
    },
  };

  // Form data for editing
  editForm = { ...this.profileData };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    // In a real app, you would fetch profile data from a service
    this.loadProfileData();
  }

  loadProfileData(): void {
    if (this.currentUser) {
      // Update profile data with current user information
      this.profileData.personalInfo.fullName =
        this.currentUser.fullNameEn || this.currentUser.fullNameAr || 'User';
      this.profileData.personalInfo.email = this.currentUser.email || '';
      this.profileData.personalInfo.phone = this.currentUser.phoneNumber || '';
      this.profileData.personalInfo.civilNumber =
        this.currentUser.civilNo || '';

      // Update professional info if department exists
      if (this.currentUser.department) {
        this.profileData.professionalInfo.department =
          this.currentUser.department.name || '';
      }

      // Update the edit form
      this.editForm = { ...this.profileData };
    }
  }

  startEditing(): void {
    this.editForm = JSON.parse(JSON.stringify(this.profileData));
    this.isEditing = true;
  }

  saveChanges(): void {
    this.profileData = JSON.parse(JSON.stringify(this.editForm));
    this.isEditing = false;
    // In a real app, you would save to backend
    console.log('Saving profile changes...');
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editForm = JSON.parse(JSON.stringify(this.profileData));
  }

  getCompletionRate(): number {
    return Math.round(
      (this.profileData.learningStats.completedCourses /
        this.profileData.learningStats.totalCourses) *
        100
    );
  }

  getProgressColor(progress: number): string {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getDaysSinceLastActive(): number {
    const lastActive = new Date(this.profileData.learningStats.lastActive);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
