import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { DepartmentService } from '../../../../core/services/department.service';
import { User } from '../../../../core/models/user.model';
import { Department } from '../../../../core/models/department.model';

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
  kpiWeight: number;
  reviewCount: number;
  priority?: number;
  isCompleted: boolean;
}

interface LibraryCollection {
  id: number;
  title: string;
  description: string;
  resources: LibraryResource[];
  curator: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

@Component({
  selector: 'app-digital-library',
  templateUrl: './digital-library.component.html',
  styleUrls: ['./digital-library.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class DigitalLibraryComponent implements OnInit {
  currentUser: User | null = null;

  // Sample digital library resources
  resources: LibraryResource[] = [
    {
      id: 1,
      title: 'Advanced Petroleum Engineering Principles',
      level: 'Advanced',
      author: 'Dr. Ahmed Al-Rashid',
      publisher: 'Petroleum Engineering Press',
      publicationDate: '2023-12-15',
      isbn: '978-1-234-56789-0',
      url: 'https://example.com/book1.pdf',
      thumbnail:
        'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      description:
        'Comprehensive guide to advanced petroleum engineering concepts and practices.',
      tags: ['petroleum', 'engineering', 'advanced', 'technical'],
      departmentIds: [1],
      language: 'English',
      pages: 450,
      isAvailable: true,
      isBookmarked: false,
      isEnrolled: false,
      kpiWeight: 85,
      reviewCount: 89,
      priority: 2,
      isCompleted: false,
    },
    {
      id: 2,
      title: 'Oil Field Management Strategies',
      level: 'Intermediate',
      author: 'Prof. Sarah Johnson',
      publisher: 'Journal of Petroleum Technology',
      publicationDate: '2024-01-20',
      doi: '10.2118/2024-001',
      url: 'https://example.com/paper1.pdf',
      thumbnail:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      description:
        'Research paper on innovative oil field management strategies for enhanced production.',
      tags: ['oil field', 'management', 'production', 'research'],
      departmentIds: [2],
      language: 'English',
      pages: 25,
      isAvailable: true,
      isBookmarked: true,
      isEnrolled: true,
      kpiWeight: 78,
      reviewCount: 45,
      priority: 2,
      isCompleted: false,
    },
    {
      id: 3,
      title: 'Digital Transformation in Oil & Gas',
      level: 'Advanced',
      author: 'Tech Solutions Inc.',
      publisher: 'Industry Conference',
      publicationDate: '2024-02-10',
      url: 'https://example.com/presentation1.pptx',
      thumbnail:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      description:
        'Presentation on digital transformation initiatives in the oil and gas industry.',
      tags: ['digital', 'transformation', 'technology', 'innovation'],
      departmentIds: [3],
      language: 'English',
      duration: '45 minutes',
      size: '15.2 MB',
      isAvailable: true,
      isBookmarked: false,
      isEnrolled: false,
      kpiWeight: 72,
      reviewCount: 23,
      priority: 2,
      isCompleted: false,
    },
    {
      id: 4,
      title: 'Environmental Impact Assessment in Oil Operations',
      level: 'Beginner',
      author: 'Environmental Research Team',
      publisher: 'Environmental Science Journal',
      publicationDate: '2024-01-05',
      doi: '10.1000/env-2024-001',
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
      isEnrolled: true,
      kpiWeight: 91,
      reviewCount: 67,
      priority: 2,
      isCompleted: false,
    },
    {
      id: 5,
      title: 'Safety Protocols in Offshore Operations',
      level: 'Advanced',
      author: 'Safety Training Institute',
      publisher: 'Industry Standards Board',
      publicationDate: '2024-01-15',
      url: 'https://example.com/video1.mp4',
      thumbnail:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      description:
        'Comprehensive video guide on safety protocols for offshore oil operations.',
      tags: ['safety', 'offshore', 'operations', 'training'],
      departmentIds: [5],
      language: 'English',
      duration: '1h 30m',
      size: '250 MB',
      isAvailable: true,
      isBookmarked: true,
      isEnrolled: false,
      kpiWeight: 95,
      reviewCount: 156,
      priority: 2,
      isCompleted: false,
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
      kpiWeight: 80,
      reviewCount: 34,
      priority: 2,
      isCompleted: false,
    },
  ];

  // Sample collections
  collections: LibraryCollection[] = [
    {
      id: 1,
      title: 'Petroleum Engineering Fundamentals',
      description:
        'Essential resources for petroleum engineering students and professionals.',
      resources: [this.resources[0], this.resources[1]],
      curator: 'Dr. Ahmed Al-Rashid',
      createdAt: '2024-01-01',
      updatedAt: '2024-02-15',
      isPublic: true,
    },
    {
      id: 2,
      title: 'Safety and Environmental Standards',
      description:
        'Collection of safety protocols and environmental guidelines.',
      resources: [this.resources[4], this.resources[3]],
      curator: 'Safety Training Institute',
      createdAt: '2024-01-10',
      updatedAt: '2024-02-10',
      isPublic: true,
    },
  ];

  // Filter options
  categories = [
    'All',
    'Engineering',
    'Research',
    'Technology',
    'Environmental',
    'Safety',
    'Economics',
  ];
  types = [
    'All',
    'book',
    'journal',
    'research_paper',
    'video',
    'audio',
    'presentation',
  ];
  languages = ['All', 'English', 'Arabic', 'French', 'Spanish'];
  levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  selectedDepartment: string = 'All';
  selectedType = 'All';
  selectedLanguage = 'All';
  selectedLevel: string = 'All';
  searchTerm = '';
  selectedSort: string = 'kpi';
  selectedEnrollment: string = 'all';

  departments: Department[] = [];

  isSearchCollapsed: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
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
  }

  get filteredResources() {
    let filtered = this.resources.filter((resource) => {
      const matchesSearch =
        !this.searchTerm ||
        resource.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        resource.author.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        resource.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        resource.tags.some((tag) =>
          tag.toLowerCase().includes(this.searchTerm.toLowerCase())
        );

      const matchesDepartment =
        this.selectedDepartment === 'All' ||
        resource.departmentIds.includes(Number(this.selectedDepartment));
      const matchesLevel =
        this.selectedLevel === 'All' || resource.level === this.selectedLevel;
      const matchesEnrollment =
        this.selectedEnrollment === 'all' ||
        (this.selectedEnrollment === 'enrolled' && resource.isEnrolled) ||
        (this.selectedEnrollment === 'completed' && resource.isCompleted);

      return (
        matchesSearch && matchesDepartment && matchesLevel && matchesEnrollment
      );
    });

    // Sorting logic
    if (this.selectedSort === 'kpi') {
      filtered = filtered.sort((a, b) => b.kpiWeight - a.kpiWeight);
    } else if (this.selectedSort === 'newest') {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.publicationDate).getTime() -
          new Date(a.publicationDate).getTime()
      );
    } else if (this.selectedSort === 'priority') {
      filtered = filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }
    return filtered;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'book':
        return 'fas fa-book';
      case 'journal':
        return 'fas fa-newspaper';
      case 'research_paper':
        return 'fas fa-file-alt';
      case 'video':
        return 'fas fa-video';
      case 'audio':
        return 'fas fa-headphones';
      case 'presentation':
        return 'fas fa-presentation';
      default:
        return 'fas fa-file';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'book':
        return 'bg-blue-100 text-blue-800';
      case 'journal':
        return 'bg-green-100 text-green-800';
      case 'research_paper':
        return 'bg-purple-100 text-purple-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'audio':
        return 'bg-yellow-100 text-yellow-800';
      case 'presentation':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'Engineering':
        return 'bg-blue-100 text-blue-800';
      case 'Research':
        return 'bg-green-100 text-green-800';
      case 'Technology':
        return 'bg-purple-100 text-purple-800';
      case 'Environmental':
        return 'bg-emerald-100 text-emerald-800';
      case 'Safety':
        return 'bg-red-100 text-red-800';
      case 'Economics':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  toggleBookmark(resource: LibraryResource): void {
    resource.isBookmarked = !resource.isBookmarked;
    // Here you would typically make an API call to update the bookmark status
  }

  toggleEnrollment(resource: LibraryResource): void {
    resource.isEnrolled = !resource.isEnrolled;
  }

  navigateToResourceDetails(resource: LibraryResource): void {
    this.router.navigate(['/admin/digital-library/resource', resource.id]);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  getDepartmentNames(departmentIds: number[]): string[] {
    return departmentIds.map((id) => {
      const dept = this.departments.find((d) => d.id === id);
      return dept ? dept.nameEn || dept.nameAr || 'Department' : 'Department';
    });
  }

  toggleSearch(): void {
    this.isSearchCollapsed = !this.isSearchCollapsed;
  }

  addNewResource(): void {
    // Navigate to add new resource page or open modal
    this.router.navigate(['/admin/digital-library/add']);
  }
}
