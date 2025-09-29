import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import { Institution } from '../../../../core/models/institution.model';
import {
  CreateInstructorDto,
  Instructor,
  UpdateInstructorDto,
} from '../../../../core/models/instructor.model';
import { PaginationRequest } from '../../../../core/models/pagination.model';
import { User, UserRole } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { InstitutionService } from '../../../../core/services/institution.service';
import { InstructorService } from '../../../../core/services/instructor.service';
import {
  DataTableComponent,
  PaginationInfo,
  TableAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-admin-instructors',
  templateUrl: './admin-instructors.component.html',
  styleUrls: ['./admin-instructors.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ModalComponent,
    DataTableComponent,
    TranslatePipe,
  ],
})
export class AdminInstructorsComponent implements OnInit {
  currentUser: User | null = null;
  instructors: Instructor[] = [];
  institutions: Institution[] = [];
  loading = false;
  saving = false;
  deleting = false;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;

  // Search and sorting properties
  searchTerm: string = '';
  sortField: string = 'nameEn';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Table configuration
  tableColumns: TableColumn[] = [
    {
      key: 'nameEn',
      label: 'instructors.columns.instructor',
      sortable: true,
      type: 'avatar',
      width: '25%',
    },
    {
      key: 'email',
      label: 'instructors.columns.email',
      sortable: true,
      type: 'text',
      width: '20%',
    },
    {
      key: 'phone',
      label: 'instructors.columns.phone',
      sortable: false,
      type: 'text',
      width: '15%',
    },
    {
      key: 'specialty',
      label: 'instructors.columns.specialty',
      sortable: true,
      type: 'text',
      width: '15%',
    },
    {
      key: 'institutionDisplay',
      label: 'instructors.columns.institution',
      sortable: false,
      type: 'text',
      width: '15%',
    },
    {
      key: 'actions',
      label: 'common.actions',
      sortable: false,
      type: 'actions',
      align: 'right',
      width: '10%',
    },
  ];

  tableActions: TableAction[] = [
    {
      label: 'common.edit',
      icon: 'fas fa-edit',
      color: 'info',
      action: 'edit',
    },
    {
      label: 'common.delete',
      icon: 'fas fa-trash',
      color: 'danger',
      action: 'delete',
    },
  ];

  paginationInfo: PaginationInfo | null = null;

  // Modal states
  showModal = false;
  showDeleteModal = false;
  isEditing = false;
  submitting = false;

  // Form data
  formData: CreateInstructorDto = {
    nameEn: '',
    nameAr: '',
    bio: '',
    email: '',
    phone: '',
    institutionId: 0,
  };

  // Image handling
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  // Delete confirmation
  instructorToDelete: Instructor | null = null;
  instructorToEdit: Instructor | null = null;
  selectedInstructor: Instructor | null = null;

  constructor(
    private authService: AuthService,
    private instructorService: InstructorService,
    private institutionService: InstitutionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadInstructors();
    this.loadInstitutions();
  }

  get isAdmin(): boolean {
    return this.currentUser?.roleId === UserRole.ADMIN;
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInstructors();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadInstructors();
  }

  getEndItemNumber(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  private loadInstructors(): void {
    this.loading = true;

    const paginationRequest: PaginationRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      order: this.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      sortBy: this.sortField,
      searchTerm: this.searchTerm,
    };

    this.instructorService.getInstructors(paginationRequest).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.instructors = response.result.map((ins: Instructor) => ({
            ...ins,
            institutionDisplay: this.getInstitutionName(
              Number(ins.institutionId)
            ),
          }));
          this.totalItems = response.pagination.total;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.currentPage = response.pagination.currentPage;

          // Update pagination info for the data table
          this.paginationInfo = {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            totalItems: this.totalItems,
            totalPages: this.totalPages,
          };
        } else {
          this.toastr.error(
            response.message || 'Failed to load instructors',
            'Error'
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
        this.loading = false;
      },
    });
  }

  private loadInstitutions(): void {
    const paginationRequest = {
      page: 1,
      pageSize: 100,
      order: 'ASC' as const,
      sortBy: 'id',
    };

    this.institutionService.getInstitutions(paginationRequest).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.institutions = response.result;
        }
      },
      error: (error) => {
        console.error('Error loading institutions:', error);
      },
    });
  }

  refreshInstructors(): void {
    this.loadInstructors();
  }

  openAddModal(): void {
    if (this.institutions.length === 0) {
      this.toastr.warning(
        'Please wait for institutions to load before adding an instructor',
        'Loading...'
      );
      return;
    }

    this.isEditing = false;
    this.formData = {
      nameEn: '',
      nameAr: '',
      bio: '',
      email: '',
      phone: '',
      institutionId: Number(this.institutions[0].id),
    };
    this.showModal = true;
  }

  openEditModal(instructor: Instructor): void {
    this.isEditing = true;
    this.instructorToEdit = instructor;
    this.formData = {
      nameEn: instructor.nameEn,
      nameAr: instructor.nameAr,
      bio: instructor.bio,
      email: instructor.email,
      phone: instructor.phone,
      institutionId: Number(instructor.institutionId),
    };

    // Reset image handling
    this.selectedImage = null;
    this.imagePreview = instructor.photoUrl
      ? this.getImageUrl(instructor.photoUrl)
      : null;

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.instructorToEdit = null;
    this.formData = {
      nameEn: '',
      nameAr: '',
      bio: '',
      email: '',
      phone: '',
      institutionId: 0,
    };

    // Reset image handling
    this.selectedImage = null;
    this.imagePreview = null;
  }

  saveInstructor(): void {
    if (!this.formData.nameEn.trim() && !this.formData.nameAr.trim()) {
      this.toastr.error('Instructor name is required', 'Validation Error');
      return;
    }

    if (!this.formData.email.trim()) {
      this.toastr.error('Email is required', 'Validation Error');
      return;
    }

    // Convert institutionId to number
    const institutionId = Number(this.formData.institutionId);
    if (!institutionId || institutionId <= 0) {
      this.toastr.error(
        'Please select a valid institution',
        'Validation Error'
      );
      return;
    }

    // Create a copy of formData with converted institutionId and image
    const instructorData = {
      ...this.formData,
      institutionId: institutionId,
      imageFile: this.selectedImage || undefined,
    };

    this.submitting = true;

    if (this.isEditing && this.instructorToEdit) {
      // Update instructor
      this.instructorService
        .updateInstructor(
          this.instructorToEdit.id,
          instructorData as UpdateInstructorDto
        )
        .subscribe({
          next: (instructor) => {
            this.toastr.success('Instructor updated successfully', 'Success');
            this.closeModal();
            this.loadInstructors();
            this.submitting = false;
          },
          error: (error) => {
            console.error('Error updating instructor:', error);
            this.submitting = false;
          },
        });
    } else {
      // Create instructor
      this.instructorService.createInstructor(instructorData).subscribe({
        next: (instructor) => {
          this.toastr.success('Instructor created successfully', 'Success');
          this.closeModal();
          this.loadInstructors();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating instructor:', error);
          this.submitting = false;
        },
      });
    }
  }

  openDeleteModal(instructor: Instructor): void {
    this.instructorToDelete = instructor;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.instructorToDelete = null;
  }

  confirmDelete(): void {
    if (!this.instructorToDelete) return;

    this.submitting = true;
    this.instructorService
      .deleteInstructor(this.instructorToDelete.id)
      .subscribe({
        next: () => {
          this.toastr.success('Instructor deleted successfully', 'Success');
          this.closeDeleteModal();
          this.loadInstructors();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error deleting instructor:', error);
          this.submitting = false;
        },
      });
  }

  // Data table event handlers
  onTableSort(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField = event.field;
    this.sortDirection = event.direction;
    this.currentPage = 1;
    this.loadInstructors();
  }

  onTableSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadInstructors();
  }

  onTableRefresh(): void {
    this.loadInstructors();
  }

  onTableAdd(): void {
    this.openAddModal();
  }

  onTablePageChange(page: number): void {
    this.currentPage = page;
    this.loadInstructors();
  }

  onTablePageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.loadInstructors();
  }

  onTableActionClick(event: { action: string; item: any }): void {
    const instructor = event.item as Instructor;

    switch (event.action) {
      case 'edit':
        this.openEditModal(instructor);
        break;
      case 'delete':
        this.openDeleteModal(instructor);
        break;
    }
  }

  getInstitutionName(institutionId: number): string {
    const institution = this.institutions.find((i) => i.id === institutionId);
    return institution ? institution.nameEn : 'Unknown';
  }

  // Image handling methods
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  getImageUrl(photoUrl?: string): string {
    if (photoUrl) {
      return `${environment.imageBaseUrl}${photoUrl}`;
    }
    return '/assets/images/default-instructor.png';
  }
}
