import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import {
  CreateInstitutionDto,
  Institution,
  UpdateInstitutionDto,
} from '../../../../core/models/institution.model';
import { PaginationRequest } from '../../../../core/models/pagination.model';
import { User, UserRole } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { InstitutionService } from '../../../../core/services/institution.service';
import {
  DataTableComponent,
  PaginationInfo,
  TableAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-admin-institutions',
  templateUrl: './admin-institutions.component.html',
  styleUrls: ['./admin-institutions.component.css'],
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
export class AdminInstitutionsComponent implements OnInit {
  currentUser: User | null = null;
  institutions: Institution[] = [];
  loading = false;

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
      label: 'institutions.columns.nameEn',
      sortable: true,
      type: 'avatar',
      width: '30%',
    },
    {
      key: 'nameAr',
      label: 'institutions.columns.nameAr',
      sortable: true,
      type: 'text',
      width: '25%',
    },
    {
      key: 'actions',
      label: 'common.actions',
      sortable: false,
      type: 'actions',
      align: 'right',
      width: '30%',
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

  // Modal properties
  showModal = false;
  showDeleteModal = false;
  isEditing = false;
  saving = false;
  deleting = false;
  submitting = false;
  institutionToDelete: Institution | null = null;
  institutionToEdit: Institution | null = null;
  selectedInstitution: Institution | null = null;
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
      order: this.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      sortBy: this.sortField,
    };

    this.institutionService.getInstitutions(request).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.institutions = response.result;
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

  // Math property for template access
  Math = Math;

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInstitutions();
  }

  onPageSizeChange(newPageSize: any): void {
    this.pageSize = +newPageSize;
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

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.loadInstitutions();
  }

  // Sorting functionality
  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadInstitutions();
  }

  // Pagination range for page buttons
  get paginationRange(): number[] {
    const range = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  // Data table event handlers
  onTableSort(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField = event.field;
    this.sortDirection = event.direction;
    this.currentPage = 1;
    this.loadInstitutions();
  }

  onTableSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadInstitutions();
  }

  onTableRefresh(): void {
    this.loadInstitutions();
  }

  onTableAdd(): void {
    this.openAddModal();
  }

  onTablePageChange(page: number): void {
    this.currentPage = page;
    this.loadInstitutions();
  }

  onTablePageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.loadInstitutions();
  }

  onTableActionClick(event: { action: string; item: any }): void {
    const institution = event.item as Institution;

    switch (event.action) {
      case 'edit':
        this.openEditModal(institution);
        break;
      case 'delete':
        this.openDeleteModal(institution);
        break;
    }
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
