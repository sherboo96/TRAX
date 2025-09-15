import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { DepartmentService } from '../../../../core/services/department.service';
import { User } from '../../../../core/models/user.model';
import { Department } from '../../../../core/models/department.model';
import { ToastrService } from 'ngx-toastr';
import { AiHelperComponent } from '../../../../shared/components/ai-helper/ai-helper.component';

interface LibraryResource {
  id: number;
  title: string;
  level: string;
  author: string;
  publisher: string;
  publicationDate: string;
  isbn?: string;
  doi?: string;
  url: string;
  thumbnail?: string;
  description: string;
  tags: string[];
  departmentIds: number[];
  language: string;
  pages?: number;
  duration?: string;
  size?: string;
  isAvailable: boolean;
  isBookmarked: boolean;
  isEnrolled: boolean;
  isCompleted: boolean;
  kpiWeight: number;
  reviewCount: number;
  priority?: number;
}

@Component({
  selector: 'app-resource-details',
  templateUrl: './resource-details.component.html',
  styleUrls: ['./resource-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AiHelperComponent],
})
export class ResourceDetailsComponent implements OnInit {
  currentUser: User | null = null;
  resource: LibraryResource | null = null;
  departments: Department[] = [];
  activeTab = 'overview';
  loading = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loading = true;

    // Load departments
    this.departmentService.getDepartments().subscribe({
      next: (res) => {
        if (res.statusCode == 200 && res.result) {
          this.departments = res.result;
        }
      },
      error: () => {
        this.departments = [];
      },
    });

    this.route.params.subscribe((params) => {
      const resourceId = +params['id'];

      if (isNaN(resourceId) || resourceId <= 0) {
        this.toastr.error('Invalid resource ID');
        this.router.navigate(['/admin/digital-library']);
        this.loading = false;
        return;
      }

      // For now, load from sample data - replace with API call later
      this.loadResourceFromSampleData(resourceId);
    });
  }

  private loadResourceFromSampleData(resourceId: number): void {
    // Sample data - replace with API call
    const sampleResources: LibraryResource[] = [
      {
        id: 1,
        title: 'Advanced Petroleum Engineering Principles',
        level: 'Advanced',
        author: 'Dr. Ahmed Al-Rashid',
        publisher: 'Petroleum Engineering Press',
        publicationDate: '2024-01-15',
        isbn: '978-1-234-56789-0',
        url: 'https://example.com/book1.pdf',
        thumbnail:
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        description:
          'Comprehensive guide to advanced petroleum engineering concepts and practices.',
        tags: ['petroleum', 'engineering', 'advanced', 'technical'],
        departmentIds: [1],
        language: 'English',
        pages: 450,
        isAvailable: true,
        isBookmarked: false,
        isEnrolled: false,
        isCompleted: false,
        kpiWeight: 85,
        reviewCount: 89,
        priority: 2,
      },
      {
        id: 2,
        title: 'Oil Field Management Strategies',
        level: 'Intermediate',
        author: 'Prof. Sarah Johnson',
        publisher: 'Journal of Petroleum Technology',
        publicationDate: '2024-02-01',
        doi: '10.1000/petroleum-2024-001',
        url: 'https://example.com/paper1.pdf',
        thumbnail:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        description:
          'Research paper on innovative oil field management strategies for enhanced production.',
        tags: ['oil field', 'management', 'production', 'research'],
        departmentIds: [2],
        language: 'English',
        pages: 25,
        isAvailable: true,
        isBookmarked: true,
        isEnrolled: true,
        isCompleted: false,
        kpiWeight: 78,
        reviewCount: 45,
        priority: 2,
      },
      {
        id: 3,
        title: 'Digital Transformation in Oil & Gas',
        level: 'Advanced',
        author: 'Tech Solutions Inc.',
        publisher: 'Industry Conference',
        publicationDate: '2024-01-20',
        url: 'https://example.com/presentation1.pptx',
        thumbnail:
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        description:
          'Presentation on digital transformation initiatives in the oil and gas industry.',
        tags: ['digital', 'transformation', 'technology', 'innovation'],
        departmentIds: [3],
        language: 'English',
        duration: '45 minutes',
        isAvailable: true,
        isBookmarked: false,
        isEnrolled: false,
        isCompleted: false,
        kpiWeight: 72,
        reviewCount: 23,
        priority: 2,
      },
      {
        id: 4,
        title: 'Environmental Impact Assessment in Oil Operations',
        level: 'Beginner',
        author: 'Environmental Research Team',
        publisher: 'Environmental Science Journal',
        publicationDate: '2024-01-10',
        doi: '10.1000/env-2024-003',
        url: 'https://example.com/journal1.pdf',
        thumbnail:
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        description:
          'Comprehensive study on environmental impact assessment methodologies in oil operations.',
        tags: ['environmental', 'impact', 'assessment', 'sustainability'],
        departmentIds: [4],
        language: 'English',
        pages: 35,
        isAvailable: true,
        isBookmarked: false,
        isEnrolled: false,
        isCompleted: false,
        kpiWeight: 91,
        reviewCount: 67,
        priority: 2,
      },
      {
        id: 5,
        title: 'Safety Protocols in Offshore Operations',
        level: 'Advanced',
        author: 'Safety Training Institute',
        publisher: 'Industry Standards Board',
        publicationDate: '2024-01-25',
        url: 'https://example.com/video1.mp4',
        thumbnail:
          'https://images.unsplash.com/photo-1581092162384-8987c1d64718?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        description:
          'Comprehensive video guide on safety protocols for offshore oil operations.',
        tags: ['safety', 'offshore', 'operations', 'training'],
        departmentIds: [5],
        language: 'English',
        duration: '1h 30m',
        isAvailable: true,
        isBookmarked: true,
        isEnrolled: true,
        isCompleted: false,
        kpiWeight: 95,
        reviewCount: 156,
        priority: 2,
      },
      {
        id: 6,
        title: 'Market Analysis: Global Oil Trends 2024',
        level: 'Intermediate',
        author: 'Economic Research Department',
        publisher: 'Global Energy Institute',
        publicationDate: '2024-02-01',
        doi: '10.1000/energy-2024-002',
        url: 'https://example.com/paper2.pdf',
        thumbnail:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        description:
          'In-depth analysis of global oil market trends and future projections for 2024.',
        tags: ['market', 'analysis', 'trends', 'economics'],
        departmentIds: [6],
        language: 'English',
        pages: 42,
        isAvailable: true,
        isBookmarked: false,
        isEnrolled: false,
        isCompleted: false,
        kpiWeight: 80,
        reviewCount: 34,
        priority: 2,
      },
    ];

    const foundResource = sampleResources.find((r) => r.id === resourceId);
    if (foundResource) {
      this.resource = foundResource;
    } else {
      this.toastr.error('Resource not found');
      this.router.navigate(['/admin/digital-library']);
    }
    this.loading = false;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getDepartmentNames(departmentIds: number[]): string[] {
    return departmentIds.map((id) => {
      const dept = this.departments.find((d) => d.id === id);
      return dept ? dept.nameEn || dept.nameAr : 'Department';
    });
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'Advanced':
        return 'bg-purple-100 text-purple-800';
      case 'Expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  toggleBookmark(): void {
    if (this.resource) {
      this.resource.isBookmarked = !this.resource.isBookmarked;
      // Here you would typically make an API call to update the bookmark status
    }
  }

  toggleEnrollment(): void {
    if (this.resource) {
      this.resource.isEnrolled = !this.resource.isEnrolled;
      // Here you would typically make an API call to update the enrollment status
    }
  }

  downloadResource(): void {
    if (this.resource) {
      // Simulate download
      console.log(`Downloading: ${this.resource.title}`);
      this.toastr.success(`Download started for: ${this.resource.title}`);
    }
  }

  editResource(): void {
    if (this.resource) {
      this.router.navigate(['/admin/digital-library/edit', this.resource.id]);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
