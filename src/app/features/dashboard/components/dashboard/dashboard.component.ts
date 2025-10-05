import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import { TranslationService } from '../../../../../locale/translation.service';
import { SupportedLanguage } from '../../../../../locale/translation.types';
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import {
  Course,
  CourseService,
  DepartmentCoursesResponse,
} from '../../../../core/services/course.service';

// Register Chart.js components
Chart.register(...registerables);

interface LearningStats {
  totalHours: number;
  weeklyHours: number;
  monthlyHours: number;
  totalCourses: number;
  completedCourses: number;
  certificatesEarned: number;
  currentStreak: number;
  averageScore: number;
  weeklyGoal: number;
  monthlyGoal: number;
  engagementRate: number;
  retentionRate: number;
}

interface CourseProgress {
  id: number;
  title: string;
  category: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedHours: number;
  lastAccessed: string;
  image: string;
}

interface WeeklyActivity {
  day: string;
  hours: number;
  lessons: number;
}

interface MonthlyProgress {
  month: string;
  hours: number;
  courses: number;
  score: number;
}

interface UpcomingCourse {
  id: number;
  title: string;
  instructor: string;
  date: string;
  time: string;
  description: string;
  location: Location;
  duration: number;
  priority: 'high' | 'medium' | 'low';
  type: 'in-person' | 'virtual' | 'hybrid';
  statusName: string;
  availableSeats: number;
  isUserRegistered: boolean;
  userRegistrationStatusName: string;
  image: string;
  // UI computed metrics
  completedPercent: number;
  averagePercent: number;
}

interface Location {
  nameEn?: string;
  nameAr?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, TranslatePipe],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('weeklyChart') weeklyChart: any;
  @ViewChild('monthlyChart') monthlyChart: any;
  @ViewChild('progressChart') progressChart: any;
  @ViewChild('scoreChart') scoreChart: any;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @ViewChild('weeklyGoalChart') weeklyGoalChartRef!: ElementRef;
  @ViewChild('monthlyGoalChart') monthlyGoalChartRef!: ElementRef;
  @ViewChild('engagementChart') engagementChartRef!: ElementRef;
  @ViewChild('retentionChart') retentionChartRef!: ElementRef;
  @ViewChild('completionChart') completionChartRef!: ElementRef;
  @ViewChild('averageScoreChart') averageScoreChartRef!: ElementRef;

  imageBaseUrl = environment.imageBaseUrl;
  currentUser: User | null = null;
  isUpcomingCoursesCollapsed = false;
  upcomingCourses: UpcomingCourse[] = [];
  isLoadingUpcomingCourses = false;

  // Translation properties
  currentLanguage: SupportedLanguage = 'en';
  isRTL = false;
  private subscription = new Subscription();

  learningStats: LearningStats = {
    totalHours: 127,
    weeklyHours: 12.5,
    monthlyHours: 48.3,
    totalCourses: 15,
    completedCourses: 8,
    certificatesEarned: 6,
    currentStreak: 7,
    averageScore: 87,
    weeklyGoal: 15,
    monthlyGoal: 60,
    engagementRate: 92,
    retentionRate: 78,
  };

  activeCourses: CourseProgress[] = [
    {
      id: 1,
      title: 'React Fundamentals',
      category: 'Frontend Development',
      progress: 75,
      totalLessons: 24,
      completedLessons: 18,
      estimatedHours: 12,
      lastAccessed: '2 hours ago',
      image:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
    },
    {
      id: 2,
      title: 'Advanced TypeScript',
      category: 'Programming',
      progress: 45,
      totalLessons: 32,
      completedLessons: 14,
      estimatedHours: 18,
      lastAccessed: '1 day ago',
      image:
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop',
    },
    {
      id: 3,
      title: 'Node.js Backend Development',
      category: 'Backend Development',
      progress: 30,
      totalLessons: 28,
      completedLessons: 8,
      estimatedHours: 20,
      lastAccessed: '3 days ago',
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
    },
    {
      id: 4,
      title: 'Angular Advanced Concepts',
      category: 'Frontend Development',
      progress: 90,
      totalLessons: 20,
      completedLessons: 18,
      estimatedHours: 15,
      lastAccessed: '5 hours ago',
      image:
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop',
    },
  ];

  weeklyActivity: WeeklyActivity[] = [
    { day: 'Mon', hours: 2.5, lessons: 4 },
    { day: 'Tue', hours: 3.2, lessons: 5 },
    { day: 'Wed', hours: 1.8, lessons: 3 },
    { day: 'Thu', hours: 2.1, lessons: 4 },
    { day: 'Fri', hours: 1.5, lessons: 2 },
    { day: 'Sat', hours: 0.8, lessons: 1 },
    { day: 'Sun', hours: 0.6, lessons: 1 },
  ];

  monthlyProgress: MonthlyProgress[] = [
    { month: 'Jan', hours: 32, courses: 2, score: 85 },
    { month: 'Feb', hours: 28, courses: 1, score: 78 },
    { month: 'Mar', hours: 35, courses: 3, score: 92 },
    { month: 'Apr', hours: 42, courses: 2, score: 88 },
    { month: 'May', hours: 38, courses: 4, score: 91 },
    { month: 'Jun', hours: 48, courses: 3, score: 87 },
  ];

  recentAchievements = [
    {
      title: 'React Fundamentals Certificate',
      description: 'Completed React Fundamentals course with 92% score',
      date: '2 days ago',
      icon: '🎓',
    },
    {
      title: '7-Day Learning Streak',
      description: 'Maintained consistent learning for 7 consecutive days',
      date: '1 day ago',
      icon: '🔥',
    },
    {
      title: 'TypeScript Master',
      description: 'Earned TypeScript Master badge',
      date: '3 days ago',
      icon: '🏆',
    },
  ];

  // Chart configurations
  weeklyChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2.5, 3.2, 1.8, 2.1, 1.5, 0.8, 0.6],
        label: 'Learning Hours',
        fill: true,
        tension: 0.4,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3B82F6',
      },
      {
        data: [4, 5, 3, 4, 2, 1, 1],
        label: 'Lessons Completed',
        fill: false,
        tension: 0.4,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#10B981',
      },
    ],
  };

  weeklyChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Learning Activity',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours / Lessons',
        },
      },
    },
  };

  monthlyChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [32, 28, 35, 42, 38, 48],
        label: 'Learning Hours',
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6',
        borderWidth: 1,
      },
      {
        data: [2, 1, 3, 2, 4, 3],
        label: 'Courses Completed',
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10B981',
        borderWidth: 1,
      },
    ],
  };

  monthlyChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Learning Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours / Courses',
        },
      },
    },
  };

  progressChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [8, 4, 3],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: ['#10B981', '#3B82F6', '#9CA3AF'],
        borderWidth: 2,
      },
    ],
  };

  progressChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Course Progress Overview',
      },
    },
  };

  scoreChartData: ChartConfiguration<'radar'>['data'] = {
    labels: ['React', 'TypeScript', 'Node.js', 'Angular', 'JavaScript', 'CSS'],
    datasets: [
      {
        data: [92, 78, 65, 88, 85, 90],
        label: 'Skill Level',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3B82F6',
      },
    ],
  };

  scoreChartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Skill Assessment',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  // Circular KPI Chart configurations
  weeklyGoalChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [this.getWeeklyGoalRate(), 100 - this.getWeeklyGoalRate()],
        backgroundColor: [
          this.getWeeklyGoalRate() >= 90
            ? '#10B981'
            : this.getWeeklyGoalRate() >= 70
            ? '#3B82F6'
            : this.getWeeklyGoalRate() >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#F3F4F6',
        ],
        borderColor: [
          this.getWeeklyGoalRate() >= 90
            ? '#10B981'
            : this.getWeeklyGoalRate() >= 70
            ? '#3B82F6'
            : this.getWeeklyGoalRate() >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#E5E7EB',
        ],
        borderWidth: 0,
      },
    ],
  };

  monthlyGoalChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [this.getMonthlyGoalRate(), 100 - this.getMonthlyGoalRate()],
        backgroundColor: [
          this.getMonthlyGoalRate() >= 90
            ? '#10B981'
            : this.getMonthlyGoalRate() >= 70
            ? '#3B82F6'
            : this.getMonthlyGoalRate() >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#F3F4F6',
        ],
        borderColor: [
          this.getMonthlyGoalRate() >= 90
            ? '#3B82F6'
            : this.getMonthlyGoalRate() >= 70
            ? '#3B82F6'
            : this.getMonthlyGoalRate() >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#E5E7EB',
        ],
        borderWidth: 0,
      },
    ],
  };

  engagementChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Engaged', 'Remaining'],
    datasets: [
      {
        data: [
          this.learningStats.engagementRate,
          100 - this.learningStats.engagementRate,
        ],
        backgroundColor: [
          this.learningStats.engagementRate >= 90
            ? '#10B981'
            : this.learningStats.engagementRate >= 70
            ? '#3B82F6'
            : this.learningStats.engagementRate >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#F3F4F6',
        ],
        borderColor: [
          this.learningStats.engagementRate >= 90
            ? '#10B981'
            : this.learningStats.engagementRate >= 70
            ? '#3B82F6'
            : this.learningStats.engagementRate >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#E5E7EB',
        ],
        borderWidth: 0,
      },
    ],
  };

  retentionChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Retained', 'Remaining'],
    datasets: [
      {
        data: [
          this.learningStats.retentionRate,
          100 - this.learningStats.retentionRate,
        ],
        backgroundColor: [
          this.learningStats.retentionRate >= 90
            ? '#10B981'
            : this.learningStats.retentionRate >= 70
            ? '#3B82F6'
            : this.learningStats.retentionRate >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#F3F4F6',
        ],
        borderColor: [
          this.learningStats.retentionRate >= 90
            ? '#10B981'
            : this.learningStats.retentionRate >= 70
            ? '#3B82F6'
            : this.learningStats.retentionRate >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#E5E7EB',
        ],
        borderWidth: 0,
      },
    ],
  };

  completionChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [this.getCompletionRate(), 100 - this.getCompletionRate()],
        backgroundColor: [
          this.getCompletionRate() >= 90
            ? '#10B981'
            : this.getCompletionRate() >= 70
            ? '#3B82F6'
            : this.getCompletionRate() >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#F3F4F6',
        ],
        borderColor: [
          this.getCompletionRate() >= 90
            ? '#10B981'
            : this.getCompletionRate() >= 70
            ? '#3B82F6'
            : this.getCompletionRate() >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#E5E7EB',
        ],
        borderWidth: 0,
      },
    ],
  };

  averageScoreChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Score', 'Remaining'],
    datasets: [
      {
        data: [
          this.learningStats.averageScore,
          100 - this.learningStats.averageScore,
        ],
        backgroundColor: [
          this.learningStats.averageScore >= 90
            ? '#10B981'
            : this.learningStats.averageScore >= 70
            ? '#3B82F6'
            : this.learningStats.averageScore >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#F3F4F6',
        ],
        borderColor: [
          this.learningStats.averageScore >= 90
            ? '#10B981'
            : this.learningStats.averageScore >= 70
            ? '#3B82F6'
            : this.learningStats.averageScore >= 50
            ? '#F59E0B'
            : '#EF4444',
          '#E5E7EB',
        ],
        borderWidth: 0,
      },
    ],
  };

  circularChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  };

  // Circular chart instances
  weeklyGoalChartInstance?: Chart;
  monthlyGoalChartInstance?: Chart;
  engagementChartInstance?: Chart;
  retentionChartInstance?: Chart;
  completionChartInstance?: Chart;
  averageScoreChartInstance?: Chart;

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadUpcomingCourses();
    this.updateLearningStatsForUser();

    // Initialize translation properties
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.isRTL = this.translationService.isRTL();

    // Subscribe to language changes
    this.subscription.add(
      this.translationService.getCurrentLanguage$().subscribe((language) => {
        this.currentLanguage = language;
        this.isRTL = this.translationService.isRTL();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateLearningStatsForUser(): void {
    // If user is not admin (roleId !== 2), show zero values
    if (this.currentUser?.userType !== 1) {
      this.learningStats = {
        totalHours: 0,
        weeklyHours: 0,
        monthlyHours: 0,
        totalCourses: 0,
        completedCourses: 0,
        certificatesEarned: 0,
        currentStreak: 0,
        averageScore: 0,
        weeklyGoal: 15,
        monthlyGoal: 60,
        engagementRate: 0,
        retentionRate: 0,
      };

      // Reset other data arrays for normal users
      this.activeCourses = [];
      this.weeklyActivity = [
        { day: 'Mon', hours: 0, lessons: 0 },
        { day: 'Tue', hours: 0, lessons: 0 },
        { day: 'Wed', hours: 0, lessons: 0 },
        { day: 'Thu', hours: 0, lessons: 0 },
        { day: 'Fri', hours: 0, lessons: 0 },
        { day: 'Sat', hours: 0, lessons: 0 },
        { day: 'Sun', hours: 0, lessons: 0 },
      ];
      this.monthlyProgress = [
        { month: 'Jan', hours: 0, courses: 0, score: 0 },
        { month: 'Feb', hours: 0, courses: 0, score: 0 },
        { month: 'Mar', hours: 0, courses: 0, score: 0 },
        { month: 'Apr', hours: 0, courses: 0, score: 0 },
        { month: 'May', hours: 0, courses: 0, score: 0 },
        { month: 'Jun', hours: 0, courses: 0, score: 0 },
      ];
      this.recentAchievements = [];

      // Update chart data for normal users
      this.updateChartDataForNormalUser();
    }
    // For admin users, keep the original values
  }

  updateChartDataForNormalUser(): void {
    // Update weekly chart data
    this.weeklyChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0, 0],
          label: 'Learning Hours',
          fill: true,
          tension: 0.4,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#3B82F6',
        },
        {
          data: [0, 0, 0, 0, 0, 0, 0],
          label: 'Lessons Completed',
          fill: false,
          tension: 0.4,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#10B981',
        },
      ],
    };

    // Update monthly chart data
    this.monthlyChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0],
          label: 'Learning Hours',
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: '#3B82F6',
          borderWidth: 1,
        },
        {
          data: [0, 0, 0, 0, 0, 0],
          label: 'Courses Completed',
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10B981',
          borderWidth: 1,
        },
      ],
    };

    // Update progress chart data
    this.progressChartData = {
      labels: ['Completed', 'In Progress', 'Not Started'],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(156, 163, 175, 0.8)',
          ],
          borderColor: ['#10B981', '#3B82F6', '#9CA3AF'],
          borderWidth: 2,
        },
      ],
    };

    // Update score chart data
    this.scoreChartData = {
      labels: [
        'React',
        'TypeScript',
        'Node.js',
        'Angular',
        'JavaScript',
        'CSS',
      ],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0],
          label: 'Skill Level',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#3B82F6',
        },
      ],
    };
  }

  loadUpcomingCourses(): void {
    this.isLoadingUpcomingCourses = true;
    this.courseService.getDepartmentCourses().subscribe({
      next: (response: DepartmentCoursesResponse) => {
        this.upcomingCourses = response.result.map((course) =>
          this.mapCourseToUpcomingCourse(course)
        );
        this.isLoadingUpcomingCourses = false;
      },
      error: (error) => {
        console.error('Error loading upcoming courses:', error);
        this.isLoadingUpcomingCourses = false;
        // Fallback to empty array or show error message
        this.upcomingCourses = [];
      },
    });
  }

  mapCourseToUpcomingCourse(course: Course): UpcomingCourse {
    const startDate = new Date(course.startDate);
    const now = new Date();

    // Reset time components to compare only dates
    const startDateOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const nowDateOnly = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const timeDiff = startDateOnly.getTime() - nowDateOnly.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    // Determine priority based on how soon the course starts
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (daysDiff <= 3) priority = 'high';
    else if (daysDiff <= 7) priority = 'medium';

    // Determine course type based on location
    let type: 'in-person' | 'virtual' | 'hybrid' = 'in-person';
    const locObj =
      typeof course.location === 'string'
        ? { nameEn: course.location, nameAr: course.location }
        : course.location || {};
    const locationName = this.isRTL
      ? locObj.nameAr || locObj.nameEn || ''
      : locObj.nameEn || locObj.nameAr || '';
    const locLower = locationName.toLowerCase();
    if (
      locLower.includes('virtual') ||
      locLower.includes('zoom') ||
      locLower.includes('teams')
    ) {
      type = 'virtual';
    } else if (locLower.includes('hybrid')) {
      type = 'hybrid';
    }

    // Format date and time
    const dateStr =
      daysDiff === 0
        ? 'Today'
        : daysDiff === 1
        ? 'Tomorrow'
        : startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

    const timeStr = (course.timeFrom as unknown as string) || '';

    // Get instructor name
    const instructorName =
      course.instructors.length > 0
        ? this.isRTL
          ? course.instructors[0].nameEn
          : course.instructors[0].nameEn
        : 'TBD';

    // Parse duration
    const durationMatch = course.duration.match(/(\d+)/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 1;

    // Compute completed percent based on start/end dates
    const start = new Date(course.startDate);
    const end = new Date(course.endDate);
    let completedPercent = 0;
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
      const nowTime = Date.now();
      const total = end.getTime() - start.getTime();
      const elapsed = Math.min(Math.max(nowTime - start.getTime(), 0), total);
      completedPercent = Math.round((elapsed / total) * 100);
    }

    // Placeholder average percent until backend provides real value
    const averagePercent = 0;

    return {
      id: course.id,
      title: this.isRTL ? course.titleAr || course.title : course.title,
      instructor: instructorName,
      date: dateStr,
      time: timeStr,
      location: {
        nameAr: this.isRTL
          ? locObj.nameAr || locObj.nameEn || ''
          : locObj.nameEn || locObj.nameAr || '',
        nameEn: this.isRTL
          ? locObj.nameEn || locObj.nameAr || ''
          : locObj.nameAr || locObj.nameEn || '',
      },
      duration: duration,
      priority: priority,
      description: this.isRTL
        ? course.descriptionAr || course.description
        : course.description,
      type: type,
      statusName: course.statusName,
      availableSeats: course.availableSeats,
      isUserRegistered: course.isUserRegistered || false,
      userRegistrationStatusName: course.userRegistrationStatusName || '',
      image: this.imageBaseUrl + course.image || '/assets/images/otclogo.png',
      completedPercent,
      averagePercent,
    };
  }

  // --- Helpers for Tailwind progress bars ---
  getBarColor(percent: number): string {
    if (percent >= 70) return '#00843d'; // green
    if (percent >= 30) return '#b68a35'; // amber
    return '#de1a31'; // red
  }

  getBarWidthStyle(percent: number): { width: string } {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    return { width: `${clamped}%` };
  }

  ngAfterViewInit(): void {
    // Check if all ViewChild references are available before creating charts
    if (this.weeklyGoalChartRef?.nativeElement) {
      this.weeklyGoalChartInstance = new Chart(
        this.weeklyGoalChartRef.nativeElement,
        {
          type: 'doughnut',
          data: this.weeklyGoalChartData,
          options: this.circularChartOptions,
        }
      );
    }

    if (this.monthlyGoalChartRef?.nativeElement) {
      this.monthlyGoalChartInstance = new Chart(
        this.monthlyGoalChartRef.nativeElement,
        {
          type: 'doughnut',
          data: this.monthlyGoalChartData,
          options: this.circularChartOptions,
        }
      );
    }

    if (this.engagementChartRef?.nativeElement) {
      this.engagementChartInstance = new Chart(
        this.engagementChartRef.nativeElement,
        {
          type: 'doughnut',
          data: this.engagementChartData,
          options: this.circularChartOptions,
        }
      );
    }

    if (this.retentionChartRef?.nativeElement) {
      this.retentionChartInstance = new Chart(
        this.retentionChartRef.nativeElement,
        {
          type: 'doughnut',
          data: this.retentionChartData,
          options: this.circularChartOptions,
        }
      );
    }

    if (this.completionChartRef?.nativeElement) {
      this.completionChartInstance = new Chart(
        this.completionChartRef.nativeElement,
        {
          type: 'doughnut',
          data: this.completionChartData,
          options: this.circularChartOptions,
        }
      );
    }

    if (this.averageScoreChartRef?.nativeElement) {
      this.averageScoreChartInstance = new Chart(
        this.averageScoreChartRef.nativeElement,
        {
          type: 'doughnut',
          data: this.averageScoreChartData,
          options: this.circularChartOptions,
        }
      );
    }
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getWeeklyTotalHours(): number {
    return this.weeklyActivity.reduce((total, day) => total + day.hours, 0);
  }

  getCompletionRate(): number {
    return Math.round(
      (this.learningStats.completedCourses / this.learningStats.totalCourses) *
        100
    );
  }

  getWeeklyGoalRate(): number {
    return Math.round(
      (this.learningStats.weeklyHours / this.learningStats.weeklyGoal) * 100
    );
  }

  getMonthlyGoalRate(): number {
    return Math.round(
      (this.learningStats.monthlyHours / this.learningStats.monthlyGoal) * 100
    );
  }

  getRateColor(rate: number): string {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-blue-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getRateBackgroundColor(rate: number): string {
    if (rate >= 90) return 'bg-green-100';
    if (rate >= 70) return 'bg-blue-100';
    if (rate >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  getRateIconColor(rate: number): string {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-blue-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getRateIconBackgroundColor(rate: number): string {
    if (rate >= 90) return 'bg-green-100';
    if (rate >= 70) return 'bg-blue-100';
    if (rate >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  joinSession(course: UpcomingCourse): void {
    console.log('Joining session:', course.title);

    // If user is already registered and approved, navigate to course details
    if (
      course.isUserRegistered &&
      course.userRegistrationStatusName === 'Approved'
    ) {
      this.router.navigate(['/courses', course.id.toString()]);
      return;
    }

    // If user is not registered or not approved, navigate to course details to register
    if (
      !course.isUserRegistered ||
      course.userRegistrationStatusName !== 'Approved'
    ) {
      this.router.navigate(['/courses', course.id.toString()]);
      return;
    }

    // Handle different session types for other cases
    switch (course.type) {
      case 'virtual':
        // Open virtual meeting link
        window.open(`https://zoom.us/j/${course.id}`, '_blank');
        break;
      case 'hybrid':
        // Show hybrid options
        alert(
          `Hybrid session: ${course.title}\nLocation: ${course.location}\nVirtual link will be provided.`
        );
        break;
      case 'in-person':
      default:
        // Show location details
        alert(
          `In-person session: ${course.title}\nLocation: ${course.location}\nTime: ${course.time}\nDate: ${course.date}`
        );
        break;
    }
  }

  toggleUpcomingCourses(): void {
    this.isUpcomingCoursesCollapsed = !this.isUpcomingCoursesCollapsed;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src =
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop';
    }
  }

  navigateToCourses(): void {
    this.router.navigate(['/courses']);
  }
}
