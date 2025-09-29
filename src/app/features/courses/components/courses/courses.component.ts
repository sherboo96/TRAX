import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { AiHelperComponent } from '../../../../shared/components/ai-helper/ai-helper.component';

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
  instructor: string;
  category: string;
  level: string;
  duration: string;
  rating: number;
  students: number;
  price: number;
  image: string;
  progress: number;
  status: string;
  description: string;
  modules: CourseModule[];
  requirements: string[];
  learningOutcomes: string[];
  lastUpdated: string;
  language: string;
  certificate: boolean;
}

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AiHelperComponent],
})
export class CoursesComponent implements OnInit {
  currentUser: User | null = null;
  appName = 'OTC Learning Platform';

  // Sample courses data with detailed resources
  courses: Course[] = [
    {
      id: 1,
      title: 'Advanced Angular Development',
      instructor: 'Dr. Sarah Johnson',
      category: 'Programming',
      level: 'Advanced',
      duration: '8 weeks',
      rating: 4.8,
      students: 1247,
      price: 0,
      image:
        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      progress: 75,
      status: 'In Progress',
      description:
        'Master advanced Angular concepts including state management, performance optimization, and enterprise patterns.',
      requirements: [
        'Basic knowledge of JavaScript and TypeScript',
        'Understanding of HTML and CSS',
        'Familiarity with Angular fundamentals',
        'Experience with web development concepts',
      ],
      learningOutcomes: [
        'Implement advanced state management with NgRx',
        'Optimize Angular application performance',
        'Write comprehensive unit and integration tests',
        'Deploy Angular applications to production',
      ],
      lastUpdated: '2024-01-15',
      language: 'English',
      certificate: true,
      modules: [
        {
          id: 1,
          title: 'State Management with NgRx',
          description: 'Learn advanced state management patterns using NgRx',
          duration: '2h 15m',
          progress: 100,
          isCompleted: true,
          resources: [
            {
              id: 1,
              title: 'Introduction to NgRx',
              type: 'video',
              duration: '15:30',
              url: 'https://example.com/video1.mp4',
              thumbnail:
                'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              description: 'Overview of NgRx and its benefits',
              isCompleted: true,
            },
            {
              id: 2,
              title: 'NgRx Architecture Guide',
              type: 'pdf',
              size: '2.5 MB',
              url: 'https://example.com/ngrx-guide.pdf',
              description: 'Comprehensive guide to NgRx architecture',
              isCompleted: true,
            },
            {
              id: 3,
              title: 'State Management Best Practices',
              type: 'video',
              duration: '25:45',
              url: 'https://example.com/video2.mp4',
              thumbnail:
                'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              description: 'Best practices for state management',
              isCompleted: true,
            },
          ],
        },
        {
          id: 2,
          title: 'Performance Optimization',
          description: 'Techniques to optimize Angular application performance',
          duration: '3h 30m',
          progress: 100,
          isCompleted: true,
          resources: [
            {
              id: 4,
              title: 'Performance Monitoring Tools',
              type: 'video',
              duration: '20:15',
              url: 'https://example.com/video3.mp4',
              thumbnail:
                'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              description: 'Tools and techniques for monitoring performance',
              isCompleted: true,
            },
            {
              id: 5,
              title: 'Optimization Strategies',
              type: 'pdf',
              size: '1.8 MB',
              url: 'https://example.com/optimization.pdf',
              description: 'Detailed optimization strategies',
              isCompleted: true,
            },
          ],
        },
        {
          id: 3,
          title: 'Testing Strategies',
          description:
            'Comprehensive testing approaches for Angular applications',
          duration: '2h 45m',
          progress: 60,
          isCompleted: false,
          resources: [
            {
              id: 6,
              title: 'Unit Testing Fundamentals',
              type: 'video',
              duration: '18:30',
              url: 'https://example.com/video4.mp4',
              thumbnail:
                'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              description: 'Introduction to unit testing in Angular',
              isCompleted: true,
            },
            {
              id: 7,
              title: 'Testing Best Practices',
              type: 'pdf',
              size: '3.2 MB',
              url: 'https://example.com/testing-guide.pdf',
              description: 'Comprehensive testing guide',
              isCompleted: false,
            },
            {
              id: 8,
              title: 'Integration Testing',
              type: 'video',
              duration: '22:10',
              url: 'https://example.com/video5.mp4',
              thumbnail:
                'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              description: 'Integration testing techniques',
              isCompleted: false,
            },
          ],
        },
        {
          id: 4,
          title: 'Deployment & CI/CD',
          description:
            'Deploy Angular applications with modern CI/CD practices',
          duration: '1h 55m',
          progress: 0,
          isCompleted: false,
          resources: [
            {
              id: 9,
              title: 'Deployment Strategies',
              type: 'video',
              duration: '16:45',
              url: 'https://example.com/video6.mp4',
              thumbnail:
                'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              description: 'Different deployment strategies',
              isCompleted: false,
            },
            {
              id: 10,
              title: 'CI/CD Pipeline Setup',
              type: 'pdf',
              size: '2.1 MB',
              url: 'https://example.com/cicd-guide.pdf',
              description: 'Setting up CI/CD pipelines',
              isCompleted: false,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      instructor: 'Prof. Michael Chen',
      category: 'Data Science',
      level: 'Intermediate',
      duration: '10 weeks',
      rating: 4.9,
      students: 2156,
      price: 0,
      image:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      progress: 100,
      status: 'Completed',
      description:
        'Learn the fundamentals of data science including statistics, machine learning, and data visualization.',
      requirements: [
        'Basic mathematics and statistics knowledge',
        'Familiarity with programming concepts',
        'Understanding of data structures',
        'Interest in data analysis',
      ],
      learningOutcomes: [
        'Apply statistical methods to data analysis',
        'Build machine learning models',
        'Create effective data visualizations',
        'Interpret and communicate data insights',
      ],
      lastUpdated: '2024-01-10',
      language: 'English',
      certificate: true,
      modules: [
        {
          id: 1,
          title: 'Introduction to Statistics',
          description: 'Fundamental statistical concepts and methods',
          duration: '4h 20m',
          progress: 100,
          isCompleted: true,
          resources: [
            {
              id: 1,
              title: 'Statistical Concepts Overview',
              type: 'video',
              duration: '25:15',
              url: 'https://example.com/stats-video1.mp4',
              thumbnail:
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              description: 'Introduction to statistical concepts',
              isCompleted: true,
            },
            {
              id: 2,
              title: 'Statistics Reference Guide',
              type: 'pdf',
              size: '4.2 MB',
              url: 'https://example.com/stats-guide.pdf',
              description: 'Comprehensive statistics reference',
              isCompleted: true,
            },
          ],
        },
        {
          id: 2,
          title: 'Python for Data Science',
          description: 'Python programming for data analysis',
          duration: '6h 15m',
          progress: 100,
          isCompleted: true,
          resources: [
            {
              id: 3,
              title: 'Python Basics for Data Science',
              type: 'video',
              duration: '30:20',
              url: 'https://example.com/python-video1.mp4',
              thumbnail:
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              description: 'Python fundamentals for data science',
              isCompleted: true,
            },
            {
              id: 4,
              title: 'Pandas and NumPy Guide',
              type: 'pdf',
              size: '3.8 MB',
              url: 'https://example.com/pandas-guide.pdf',
              description: 'Complete guide to Pandas and NumPy',
              isCompleted: true,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      title: 'Project Management Professional',
      instructor: 'Dr. Emily Rodriguez',
      category: 'Business',
      level: 'Advanced',
      duration: '12 weeks',
      rating: 4.7,
      students: 892,
      price: 0,
      image:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      progress: 25,
      status: 'In Progress',
      description:
        'Prepare for PMP certification with comprehensive project management training and real-world case studies.',
      requirements: [
        "Bachelor's degree or equivalent",
        '4500 hours of project management experience',
        '35 hours of project management education',
        'Understanding of business processes',
      ],
      learningOutcomes: [
        'Understand PMP exam structure and requirements',
        'Apply project management methodologies',
        'Manage project scope, time, and cost',
        'Lead project teams effectively',
      ],
      lastUpdated: '2024-01-12',
      language: 'English',
      certificate: true,
      modules: [
        {
          id: 1,
          title: 'Project Integration Management',
          description: 'Core concepts of project integration',
          duration: '3h 10m',
          progress: 100,
          isCompleted: true,
          resources: [
            {
              id: 1,
              title: 'Integration Management Overview',
              type: 'video',
              duration: '28:45',
              url: 'https://example.com/pmp-video1.mp4',
              thumbnail:
                'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              description: 'Overview of project integration management',
              isCompleted: true,
            },
            {
              id: 2,
              title: 'PMP Integration Guide',
              type: 'pdf',
              size: '5.1 MB',
              url: 'https://example.com/pmp-integration.pdf',
              description: 'Detailed PMP integration management guide',
              isCompleted: true,
            },
          ],
        },
      ],
    },
  ];

  // Filter options
  categories = [
    'All',
    'Programming',
    'Data Science',
    'Business',
    'Marketing',
    'Security',
    'Leadership',
  ];
  levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  statuses = ['All', 'Not Started', 'In Progress', 'Completed'];

  selectedCategory = 'All';
  selectedLevel = 'All';
  selectedStatus = 'All';
  searchTerm = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  get filteredCourses() {
    return this.courses.filter((course) => {
      const matchesCategory =
        this.selectedCategory === 'All' ||
        course.category === this.selectedCategory;
      const matchesLevel =
        this.selectedLevel === 'All' || course.level === this.selectedLevel;
      const matchesStatus =
        this.selectedStatus === 'All' || course.status === this.selectedStatus;
      const matchesSearch =
        course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.instructor
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        course.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      return matchesCategory && matchesLevel && matchesStatus && matchesSearch;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Beginner':
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

  navigateToCourseDetails(course: Course): void {
    this.router.navigate(['/courses', course.id]);
  }

  getTotalResources(course: Course): number {
    return course.modules.reduce(
      (total, module) => total + module.resources.length,
      0
    );
  }

  getCompletedResources(course: Course): number {
    return course.modules.reduce(
      (total, module) =>
        total +
        module.resources.filter((resource) => resource.isCompleted).length,
      0
    );
  }
}
