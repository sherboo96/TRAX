import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { DepartmentService } from '../../../../core/services/department.service';
import { OrganizationService } from '../../../../core/services/organization.service';
import { ToastrService } from 'ngx-toastr';
import { User, UserRole } from '../../../../core/models/user.model';
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '../../../../core/models/department.model';
import { Organization } from '../../../../core/models/organization.model';

@Component({
  selector: 'app-admin-departments',
  templateUrl: './admin-departments.component.html',
  styleUrls: ['./admin-departments.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingComponent,
    ModalComponent,
  ],
})
export class AdminDepartmentsComponent implements OnInit, AfterViewInit {
  currentUser: User | null = null;
  departments: Department[] = [];
  organizations: Organization[] = [];
  loading = false;
  saving = false;
  deleting = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Filters
  filters = {
    order: 'ASC',
    isDepartment: false,
    isInspector: false,
    isUpperManagement: false,
  };

  // Modal states
  showModal = false;
  showDeleteModal = false;
  isEditing = false;

  // Form data
  formData: CreateDepartmentDto = {
    nameEn: '',
    nameAr: '',
    type: 'Dep',
    mainType: 'D',
    organizationId: 0,
  };

  // Delete confirmation
  departmentToDelete: Department | null = null;
  departmentToEdit: Department | null = null;

  constructor(
    private authService: AuthService,
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadDepartments();
    this.loadOrganizations();
  }

  ngAfterViewInit(): void {
    console.log(
      'Component initialized with departments:',
      this.departments.length
    );
    console.log('Departments data:', this.departments);
  }

  get isAdmin(): boolean {
    return this.currentUser?.roleId === UserRole.ADMIN;
  }

  private loadDepartments(): void {
    this.loading = true;
    console.log(
      'Loading departments with page:',
      this.currentPage,
      'pageSize:',
      this.pageSize,
      'filters:',
      this.filters
    );
    this.departmentService
      .getDepartments(this.currentPage, this.pageSize, this.filters)
      .subscribe({
        next: (response) => {
          console.log('Department response:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', Object.keys(response));

          if (response.statusCode == 200) {
            this.departments = response.result;
            this.totalItems = response.pagination.total;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
            console.log(
              'Departments loaded:',
              this.departments.length,
              'Total:',
              this.totalItems
            );
            console.log('First department:', this.departments[0]);
          } else {
            this.toastr.error(
              response.message || 'Failed to load departments',
              'Error'
            );
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading departments:', error);
          this.loading = false;
        },
      });
  }

  private loadOrganizations(): void {
    this.organizationService.getOrganizations().subscribe({
      next: (response) => {
        if (response.statusCode == 200) {
          this.organizations = response.result;
        } else {
          this.toastr.error(
            response.message || 'Failed to load organizations',
            'Error'
          );
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
      },
    });
  }

  refreshDepartments(): void {
    this.currentPage = 1;
    this.loadDepartments();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDepartments();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.loadDepartments();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadDepartments();
  }

  clearFilters(): void {
    this.filters = {
      order: 'ASC',
      isDepartment: false,
      isInspector: false,
      isUpperManagement: false,
    };
    this.currentPage = 1;
    this.loadDepartments();
  }

  openEditModal(department: Department): void {
    this.isEditing = true;
    this.departmentToEdit = department;
    this.formData = {
      nameEn: department.nameEn,
      nameAr: department.nameAr,
      type: department.type,
      mainType: department.mainType,
      baseDepartmentId: department.baseDepartmentId,
      organizationId: department.organizationId,
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.departmentToEdit = null;
    this.formData = {
      nameEn: '',
      nameAr: '',
      type: 'Dep',
      mainType: 'D',
      organizationId: 0,
    };
  }

  saveDepartment(): void {
    if (!this.formData.nameEn.trim() && !this.formData.nameAr.trim()) {
      this.toastr.error(
        'At least one department name is required',
        'Validation Error'
      );
      return;
    }

    this.saving = true;

    if (this.isEditing && this.departmentToEdit) {
      // Update department
      this.departmentService
        .updateDepartment(
          this.departmentToEdit.id,
          this.formData as UpdateDepartmentDto
        )
        .subscribe({
          next: (department) => {
            this.toastr.success('Department updated successfully', 'Success');
            this.closeModal();
            this.loadDepartments();
            this.saving = false;
          },
          error: (error) => {
            console.error('Error updating department:', error);
            this.saving = false;
          },
        });
    } else {
      // Create department
      this.departmentService.createDepartment(this.formData).subscribe({
        next: (department) => {
          this.toastr.success('Department created successfully', 'Success');
          this.closeModal();
          this.loadDepartments();
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating department:', error);
          this.saving = false;
        },
      });
    }
  }

  openDeleteModal(department: Department): void {
    this.departmentToDelete = department;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.departmentToDelete = null;
  }

  confirmDelete(): void {
    if (!this.departmentToDelete) return;

    this.deleting = true;
    this.departmentService
      .deleteDepartment(this.departmentToDelete.id)
      .subscribe({
        next: () => {
          this.toastr.success('Department deleted successfully', 'Success');
          this.closeDeleteModal();
          this.loadDepartments();
          this.deleting = false;
        },
        error: (error) => {
          console.error('Error deleting department:', error);
          this.deleting = false;
        },
      });
  }

  getDepartmentDisplayName(department: Department | null): string {
    if (!department) return 'N/A';
    if (department.nameEn && department.nameAr) {
      return `${department.nameEn} / ${department.nameAr}`;
    }
    return department.nameEn || department.nameAr || 'N/A';
  }

  getOrganizationDisplayName(organization: Organization | null): string {
    if (!organization) return 'N/A';
    if (organization.nameEn && organization.nameAr) {
      return `${organization.nameEn} / ${organization.nameAr}`;
    }
    return organization.nameEn || organization.nameAr || 'N/A';
  }

  getEndItemNumber(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filters.isDepartment) count++;
    if (this.filters.isInspector) count++;
    if (this.filters.isUpperManagement) count++;
    if (this.filters.order !== 'ASC') count++;
    return count;
  }

  hasActiveFilters(): boolean {
    return this.getActiveFiltersCount() > 0;
  }
}
