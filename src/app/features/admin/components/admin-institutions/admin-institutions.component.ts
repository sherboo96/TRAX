import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { InstitutionService } from '../../../../core/services/institution.service';
import { ToastrService } from 'ngx-toastr';
import { User, UserRole } from '../../../../core/models/user.model';
import {
  Institution,
  CreateInstitutionDto,
  UpdateInstitutionDto,
} from '../../../../core/models/institution.model';
import { PaginationRequest } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-admin-institutions',
  templateUrl: './admin-institutions.component.html',
  styleUrls: ['./admin-institutions.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingComponent,
    ModalComponent,
  ],
})
export class AdminInstitutionsComponent implements OnInit {
  currentUser: User | null = null;
  institutions: Institution[] = [];
  loading = false;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;

  // Modal properties
  showModal = false;
  showDeleteModal = false;
  isEditing = false;
  saving = false;
  deleting = false;
  institutionToDelete: Institution | null = null;
  institutionToEdit: Institution | null = null;
  formData: CreateInstitutionDto = { nameEn: '', nameAr: '' };

  constructor(
    private authService: AuthService,
    private institutionService: InstitutionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadInstitutions();
  }

  private loadInstitutions(): void {
    this.loading = true;

    const request: PaginationRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      order: 'ASC',
      sortBy: 'id',
    };

    this.institutionService.getInstitutions(request).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.institutions = response.result;
          this.totalItems = response.pagination.total;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.currentPage = response.pagination.currentPage;
        } else {
          this.toastr.error(
            response.message || 'Failed to load institutions',
            'Error'
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading institutions:', error);
        this.loading = false;
      },
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.roleId === UserRole.ADMIN;
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInstitutions();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadInstitutions();
  }

  getEndItemNumber(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  // Modal methods
  openAddModal(): void {
    this.isEditing = false;
    this.formData = { nameEn: '', nameAr: '' };
    this.showModal = true;
  }

  openEditModal(institution: Institution): void {
    this.isEditing = true;
    this.institutionToEdit = institution;
    this.formData = { nameEn: institution.nameEn, nameAr: institution.nameAr };
    this.showModal = true;
  }

  openDeleteModal(institution: Institution): void {
    this.institutionToDelete = institution;
    this.showDeleteModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.formData = { nameEn: '', nameAr: '' };
    this.institutionToEdit = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.institutionToDelete = null;
  }

  saveInstitution(): void {
    if (!this.formData.nameEn.trim() && !this.formData.nameAr.trim()) {
      this.toastr.error('Institution name is required', 'Validation Error');
      return;
    }

    this.saving = true;

    if (this.isEditing && this.institutionToEdit) {
      // Update existing institution
      const updateData: UpdateInstitutionDto = {
        nameEn: this.formData.nameEn,
        nameAr: this.formData.nameAr,
      };
      this.institutionService
        .updateInstitution(this.institutionToEdit.id, updateData)
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadInstitutions();
            this.saving = false;
            this.toastr.success('Institution updated successfully');
          },
          error: (error) => {
            console.error('Error updating institution:', error);
            this.saving = false;
          },
        });
    } else {
      // Create new institution
      const createData: CreateInstitutionDto = {
        nameEn: this.formData.nameEn,
        nameAr: this.formData.nameAr,
      };
      this.institutionService.createInstitution(createData).subscribe({
        next: () => {
          this.closeModal();
          this.loadInstitutions();
          this.saving = false;
          this.toastr.success('Institution created successfully');
        },
        error: (error) => {
          console.error('Error creating institution:', error);
          this.saving = false;
        },
      });
    }
  }

  confirmDelete(): void {
    if (!this.institutionToDelete) {
      return;
    }

    this.deleting = true;
    this.institutionService
      .deleteInstitution(this.institutionToDelete.id)
      .subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadInstitutions();
          this.deleting = false;
          this.toastr.success('Institution deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting institution:', error);
          this.deleting = false;
        },
      });
  }

  refreshInstitutions(): void {
    this.loadInstitutions();
  }

  // Legacy methods for backward compatibility
  addInstitution(): void {
    this.openAddModal();
  }

  editInstitution(institutionId: number): void {
    const institution = this.institutions.find((i) => i.id === institutionId);
    if (institution) {
      this.openEditModal(institution);
    }
  }

  deleteInstitution(institutionId: number): void {
    const institution = this.institutions.find((i) => i.id === institutionId);
    if (institution) {
      this.openDeleteModal(institution);
    }
  }
}
