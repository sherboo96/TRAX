import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { OrganizationService } from '../../../../core/services/organization.service';
import { ToastrService } from 'ngx-toastr';
import { User, UserRole } from '../../../../core/models/user.model';
import {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../../../../core/models/organization.model';
import { PaginationRequest } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-admin-organizations',
  templateUrl: './admin-organizations.component.html',
  styleUrls: ['./admin-organizations.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingComponent,
    ModalComponent,
  ],
})
export class AdminOrganizationsComponent implements OnInit {
  currentUser: User | null = null;
  organizations: Organization[] = [];
  loading = false;
  saving = false;
  deleting = false;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;
  paginationInfo = {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  };

  // Modal states
  showModal = false;
  showDeleteModal = false;
  isEditing = false;

  // Form data
  formData: CreateOrganizationDto = {
    nameAr: '',
    nameEn: '',
  };

  // Delete confirmation
  organizationToDelete: Organization | null = null;
  organizationToEdit: Organization | null = null;

  constructor(
    private authService: AuthService,
    private organizationService: OrganizationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadOrganizations();
  }

  get isAdmin(): boolean {
    return this.currentUser?.roleId === UserRole.ADMIN;
  }

  private loadOrganizations(): void {
    this.loading = true;

    const paginationRequest: PaginationRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      order: 'ASC',
      sortBy: 'id',
    };

    this.organizationService.getOrganizations(paginationRequest).subscribe({
      next: (response) => {
        if (response.statusCode == 200) {
          this.organizations = response.result;
          this.totalItems = response.pagination.total;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.currentPage = response.pagination.currentPage;
          this.paginationInfo = {
            currentPage: response.pagination.currentPage,
            pageSize: response.pagination.pageSize,
            total: response.pagination.total,
          };
        } else {
          this.toastr.error(
            response.message || 'Failed to load organizations',
            'Error'
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.loading = false;
      },
    });
  }

  refreshOrganizations(): void {
    this.loadOrganizations();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.organizationToEdit = null;
    this.formData = {
      nameAr: '',
      nameEn: '',
    };
    this.showModal = true;
  }

  openEditModal(organization: Organization): void {
    this.isEditing = true;
    this.organizationToEdit = organization;
    this.formData = {
      nameAr: organization.nameAr,
      nameEn: organization.nameEn,
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.organizationToEdit = null;
    this.formData = {
      nameAr: '',
      nameEn: '',
    };
  }

  saveOrganization(): void {
    if (!this.formData.nameEn.trim() && !this.formData.nameAr.trim()) {
      this.toastr.error('Organization name is required', 'Validation Error');
      return;
    }

    this.saving = true;

    if (this.isEditing && this.organizationToEdit) {
      // Update organization
      this.organizationService
        .updateOrganization(
          this.organizationToEdit.id,
          this.formData as UpdateOrganizationDto
        )
        .subscribe({
          next: (organization) => {
            this.toastr.success('Organization updated successfully', 'Success');
            this.closeModal();
            this.loadOrganizations();
            this.saving = false;
          },
          error: (error) => {
            console.error('Error updating organization:', error);
            this.saving = false;
          },
        });
    } else {
      // Create organization
      this.organizationService.createOrganization(this.formData).subscribe({
        next: (organization) => {
          this.toastr.success('Organization created successfully', 'Success');
          this.closeModal();
          this.loadOrganizations();
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating organization:', error);
          this.saving = false;
        },
      });
    }
  }

  openDeleteModal(organization: Organization): void {
    this.organizationToDelete = organization;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.organizationToDelete = null;
  }

  confirmDelete(): void {
    if (!this.organizationToDelete) return;

    this.deleting = true;
    this.organizationService
      .deleteOrganization(this.organizationToDelete.id)
      .subscribe({
        next: () => {
          this.toastr.success('Organization deleted successfully', 'Success');
          this.closeDeleteModal();
          this.loadOrganizations();
          this.deleting = false;
        },
        error: (error) => {
          console.error('Error deleting organization:', error);
          this.deleting = false;
        },
      });
  }

  onTableAction(event: { name: string; row: any }): void {
    const organization = event.row as Organization;

    switch (event.name) {
      case 'edit':
        this.openEditModal(organization);
        break;
      case 'delete':
        this.openDeleteModal(organization);
        break;
    }
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrganizations();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadOrganizations();
  }

  getEndItemNumber(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
}
