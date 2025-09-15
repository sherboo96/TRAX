import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { InstructorService } from '../../../../core/services/instructor.service';
import { InstitutionService } from '../../../../core/services/institution.service';
import { ToastrService } from 'ngx-toastr';
import { User, UserRole } from '../../../../core/models/user.model';
import {
  Instructor,
  CreateInstructorDto,
  UpdateInstructorDto,
} from '../../../../core/models/instructor.model';
import { Institution } from '../../../../core/models/institution.model';
import { PaginationRequest } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-admin-instructors',
  templateUrl: './admin-instructors.component.html',
  styleUrls: ['./admin-instructors.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingComponent,
    ModalComponent,
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

  // Modal states
  showModal = false;
  showDeleteModal = false;
  isEditing = false;

  // Form data
  formData: CreateInstructorDto = {
    nameEn: '',
    nameAr: '',
    bio: '',
    email: '',
    phone: '',
    institutionId: 0,
  };

  // Delete confirmation
  instructorToDelete: Instructor | null = null;
  instructorToEdit: Instructor | null = null;

  // Table configuration
  tableColumns: any[] = []; // This will be initialized in ngOnInit
  paginationRequest: PaginationRequest = {
    page: 1,
    pageSize: 10,
    order: 'ASC' as const,
    sortBy: 'id',
  };

  tableActions = [
    {
      name: 'edit',
      svg: `<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>`,
      class: 'text-blue-600 hover:text-blue-800',
    },
    {
      name: 'delete',
      svg: `<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
      </svg>`,
      class: 'text-red-600 hover:text-red-800',
    },
  ];

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

    // Initialize table columns after templates are available
    this.tableColumns = [
      {
        header: 'Instructor',
        field: 'fullName',
        cellTemplate: null, // No template for now, will be added later
      },
      { header: 'Email', field: 'email' },
      { header: 'Phone', field: 'phoneNumber' },
      { header: 'Specialty', field: 'specialty' },
      {
        header: 'Institution',
        field: 'institutionId',
        cellTemplate: null, // No template for now, will be added later
      },
      { header: 'Status', field: 'status', cellTemplate: null }, // No template for now, will be added later
    ];
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
      order: 'ASC',
      sortBy: 'id',
    };

    this.instructorService.getInstructors(paginationRequest).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.instructors = response.result;
          this.totalItems = response.pagination.total;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.currentPage = response.pagination.currentPage;
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
    this.isEditing = false;
    this.formData = {
      nameEn: '',
      nameAr: '',
      bio: '',
      email: '',
      phone: '',
      institutionId: this.institutions.length > 0 ? this.institutions[0].id : 0,
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
      institutionId: instructor.institutionId,
    };
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
  }

  saveInstructor(): void {
    if (!this.formData.nameEn.trim() && !this.formData.nameAr.trim()) {
      this.toastr.error('Instructor name is required', 'Validation Error');
      return;
    }

    this.saving = true;

    if (this.isEditing && this.instructorToEdit) {
      // Update instructor
      this.instructorService
        .updateInstructor(
          this.instructorToEdit.id,
          this.formData as UpdateInstructorDto
        )
        .subscribe({
          next: (instructor) => {
            this.toastr.success('Instructor updated successfully', 'Success');
            this.closeModal();
            this.loadInstructors();
            this.saving = false;
          },
          error: (error) => {
            console.error('Error updating instructor:', error);
            this.saving = false;
          },
        });
    } else {
      // Create instructor
      this.instructorService.createInstructor(this.formData).subscribe({
        next: (instructor) => {
          this.toastr.success('Instructor created successfully', 'Success');
          this.closeModal();
          this.loadInstructors();
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating instructor:', error);
          this.saving = false;
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

    this.deleting = true;
    this.instructorService
      .deleteInstructor(this.instructorToDelete.id)
      .subscribe({
        next: () => {
          this.toastr.success('Instructor deleted successfully', 'Success');
          this.closeDeleteModal();
          this.loadInstructors();
          this.deleting = false;
        },
        error: (error) => {
          console.error('Error deleting instructor:', error);
          this.deleting = false;
        },
      });
  }

  onTableAction(event: { name: string; row: any }): void {
    const instructor = event.row as Instructor;

    switch (event.name) {
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
}
