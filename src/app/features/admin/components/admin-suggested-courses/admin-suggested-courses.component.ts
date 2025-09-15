import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { SuggestedCourseService } from '../../../../core/services/suggested-course.service';
import { RegistrationStatusService } from '../../../../core/services/registration-status.service';
import { ToastrService } from 'ngx-toastr';
import { User, UserRole } from '../../../../core/models/user.model';
import {
  SuggestedCourse,
  CreateSuggestedCourseDto,
  UpdateSuggestedCourseDto,
} from '../../../../core/models/suggested-course.model';
import { RegistrationStatus } from '../../../../core/models/registration-status.model';
import { PaginationRequest } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-admin-suggested-courses',
  templateUrl: './admin-suggested-courses.component.html',
  styleUrls: ['./admin-suggested-courses.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingComponent,
    ModalComponent,
  ],
})
export class AdminSuggestedCoursesComponent implements OnInit {
  currentUser: User | null = null;
  suggestedCourses: SuggestedCourse[] = [];
  registrationStatuses: RegistrationStatus[] = [];
  loading = false;
  saving = false;
  deleting = false;
  loadingStatuses = false;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;

  // Modal states
  showModal = false;
  showDeleteModal = false;
  showDetailsModal = false;
  isEditing = false;

  // View mode
  viewMode: 'grid' | 'table' = 'grid';

  // Form data
  formData: CreateSuggestedCourseDto = {
    title: '',
    description: '',
    priority: 1,
    isForDepartment: false,
    registerationStatusId: 1,
  };

  // Delete confirmation
  suggestedCourseToDelete: SuggestedCourse | null = null;
  suggestedCourseToEdit: SuggestedCourse | null = null;
  suggestedCourseToShow: SuggestedCourse | null = null;

  constructor(
    private authService: AuthService,
    private suggestedCourseService: SuggestedCourseService,
    private registrationStatusService: RegistrationStatusService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadSuggestedCourses();
    this.loadRegistrationStatuses();
  }

  get isAdmin(): boolean {
    return this.currentUser?.roleId === UserRole.ADMIN;
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadSuggestedCourses();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadSuggestedCourses();
  }

  getEndItemNumber(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  private loadSuggestedCourses(): void {
    this.loading = true;

    const paginationRequest: PaginationRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      order: 'ASC',
      sortBy: 'id',
    };

    this.suggestedCourseService
      .getSuggestedCourses(paginationRequest)
      .subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            this.suggestedCourses = response.result;
            this.totalItems = response.pagination.total;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
            this.currentPage = response.pagination.currentPage;
          } else {
            this.toastr.error(
              response.message || 'Failed to load suggested courses',
              'Error'
            );
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading suggested courses:', error);
          this.loading = false;
        },
      });
  }

  private loadRegistrationStatuses(): void {
    this.loadingStatuses = true;

    const paginationRequest: PaginationRequest = {
      page: 1,
      pageSize: 100,
      order: 'ASC',
      sortBy: 'id',
    };

    this.registrationStatusService
      .getRegistrationStatuses(paginationRequest)
      .subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            this.registrationStatuses = response.result;
            // Set default status if available
            if (this.registrationStatuses.length > 0) {
              this.formData.registerationStatusId =
                this.registrationStatuses[0].id;
            }
          } else {
            this.toastr.error(
              response.message || 'Failed to load registration statuses',
              'Error'
            );
          }
          this.loadingStatuses = false;
        },
        error: (error) => {
          console.error('Error loading registration statuses:', error);
          this.loadingStatuses = false;
        },
      });
  }

  refreshSuggestedCourses(): void {
    this.loadSuggestedCourses();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.formData = {
      title: '',
      description: '',
      priority: 1,
      isForDepartment: false,
      registerationStatusId:
        this.registrationStatuses.length > 0
          ? this.registrationStatuses[0].id
          : 1,
    };
    this.showModal = true;
  }

  openEditModal(suggestedCourse: SuggestedCourse): void {
    this.isEditing = true;
    this.suggestedCourseToEdit = suggestedCourse;
    this.formData = {
      title: suggestedCourse.title,
      description: suggestedCourse.description,
      priority: suggestedCourse.priority,
      isForDepartment: suggestedCourse.isForDepartment,
      registerationStatusId: suggestedCourse.registerationStatusId,
    };
    this.showModal = true;
  }

  openDeleteModal(suggestedCourse: SuggestedCourse): void {
    this.suggestedCourseToDelete = suggestedCourse;
    this.showDeleteModal = true;
  }

  openShowModal(suggestedCourse: SuggestedCourse): void {
    this.suggestedCourseToShow = suggestedCourse;
    this.showDetailsModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.suggestedCourseToEdit = null;
    this.formData = {
      title: '',
      description: '',
      priority: 1,
      isForDepartment: false,
      registerationStatusId:
        this.registrationStatuses.length > 0
          ? this.registrationStatuses[0].id
          : 1,
    };
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.suggestedCourseToDelete = null;
  }

  closeShowModal(): void {
    this.showDetailsModal = false;
    this.suggestedCourseToShow = null;
  }

  saveSuggestedCourse(): void {
    if (!this.formData.title.trim()) {
      this.toastr.error('Course title is required', 'Validation Error');
      return;
    }

    this.saving = true;

    if (this.isEditing && this.suggestedCourseToEdit) {
      // Update suggested course
      const updateData: UpdateSuggestedCourseDto = {
        title: this.formData.title,
        description: this.formData.description,
        priority: this.formData.priority,
        isForDepartment: this.formData.isForDepartment,
        registerationStatusId: this.formData.registerationStatusId,
      };
      this.suggestedCourseService
        .updateSuggestedCourse(this.suggestedCourseToEdit.id, updateData)
        .subscribe({
          next: () => {
            this.toastr.success(
              'Suggested course updated successfully',
              'Success'
            );
            this.closeModal();
            this.loadSuggestedCourses();
            this.saving = false;
          },
          error: (error) => {
            console.error('Error updating suggested course:', error);
            this.saving = false;
          },
        });
    } else {
      // Create suggested course
      const createData: CreateSuggestedCourseDto = {
        title: this.formData.title,
        description: this.formData.description,
        priority: this.formData.priority,
        isForDepartment: this.formData.isForDepartment,
        registerationStatusId: this.formData.registerationStatusId,
      };
      this.suggestedCourseService.createSuggestedCourse(createData).subscribe({
        next: () => {
          this.toastr.success(
            'Suggested course created successfully',
            'Success'
          );
          this.closeModal();
          this.loadSuggestedCourses();
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating suggested course:', error);
          this.saving = false;
        },
      });
    }
  }

  confirmDelete(): void {
    if (!this.suggestedCourseToDelete) return;

    this.deleting = true;
    this.suggestedCourseService
      .deleteSuggestedCourse(this.suggestedCourseToDelete.id)
      .subscribe({
        next: () => {
          this.toastr.success(
            'Suggested course deleted successfully',
            'Success'
          );
          this.closeDeleteModal();
          this.loadSuggestedCourses();
          this.deleting = false;
        },
        error: (error) => {
          console.error('Error deleting suggested course:', error);
          this.deleting = false;
        },
      });
  }

  getRegistrationStatusName(id: number): string {
    const status = this.registrationStatuses.find((s) => s.id === id);
    return status ? status.nameEn : 'Unknown';
  }

  getPriorityColor(priority: number): string {
    if (priority >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  }

  getPriorityText(priority: number): string {
    if (priority >= 8) return 'High';
    if (priority >= 5) return 'Medium';
    return 'Low';
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'table' : 'grid';
  }
}
