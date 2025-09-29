import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import { TranslationService } from '../../../../../locale/translation.service';
import {
  CreateLocationDto,
  Location,
  LocationCategory,
} from '../../../../core/models/location.model';
import { LocationService } from '../../../../core/services/location.service';
import {
  DataTableComponent,
  PaginationInfo,
  TableAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-admin-locations',
  templateUrl: './admin-locations.component.html',
  styleUrls: ['./admin-locations.component.css'],
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
export class AdminLocationsComponent implements OnInit {
  locations: Location[] = [];
  loading = false;
  saving = false;
  deleting = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  paginationInfo: PaginationInfo | null = null;

  // Search and sorting
  searchTerm = '';
  sortField = 'nameEn';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Modal
  showModal = false;
  showDeleteModal = false;
  isEditing = false;
  locationToEdit: Location | null = null;
  locationToDelete: Location | null = null;

  formData: CreateLocationDto = {
    nameEn: '',
    nameAr: '',
    addressEn: '',
    addressAr: '',
    city: '',
    country: '',
    category: LocationCategory.OnSite,
    isActive: true,
  };

  onTemplateSelected(event: any): void {
    const file = event.target.files && event.target.files[0];
    if (file) {
      this.formData.templateFile = file;
    }
  }

  tableColumns: TableColumn[] = [
    {
      key: 'nameEn',
      label: 'locations.name',
      sortable: true,
      type: 'text',
      width: '20%',
    },
    {
      key: 'nameAr',
      label: 'locations.nameAr',
      sortable: true,
      type: 'text',
      width: '20%',
    },
    {
      key: 'city',
      label: 'locations.city',
      sortable: true,
      type: 'text',
      width: '15%',
    },
    {
      key: 'country',
      label: 'locations.country',
      sortable: true,
      type: 'text',
      width: '15%',
    },
    {
      key: 'categoryDisplay',
      label: 'locations.category',
      sortable: true,
      type: 'text',
      width: '15%',
    },
    {
      key: 'isActive',
      label: 'common.status',
      sortable: true,
      type: 'status',
      width: '10%',
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
    {
      label: 'common.toggle',
      icon: 'fas fa-toggle-on',
      color: 'warning',
      action: 'toggle',
    },
    {
      label: 'common.download',
      icon: 'fas fa-download',
      color: 'primary',
      action: 'download',
      show: (item: any) => !!item.templateUrl,
    },
  ];

  categories = [
    { value: LocationCategory.OnSite, labelKey: 'locations.categories.onSite' },
    {
      value: LocationCategory.OutSite,
      labelKey: 'locations.categories.outSite',
    },
    {
      value: LocationCategory.OnlineVideo,
      labelKey: 'locations.categories.onlineVideo',
    },
    { value: LocationCategory.Abroad, labelKey: 'locations.categories.abroad' },
  ];

  LocationCategory = LocationCategory;

  constructor(
    private locationService: LocationService,
    private toastr: ToastrService,
    private t: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.loading = true;
    this.locationService.getAll().subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.locations = res.result.map((l: any) => ({
            ...l,
            categoryDisplay: this.t.translate(this.getCategoryKey(l.category)),
          }));
          this.totalItems = this.locations.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.paginationInfo = {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            totalItems: this.totalItems,
            totalPages: this.totalPages,
          };
        } else {
          this.toastr.error(res.message || 'Failed to load locations', 'Error');
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load locations', 'Error');
        this.loading = false;
      },
    });
  }

  // Data table handlers
  onTableSort(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField = event.field;
    this.sortDirection = event.direction;
  }

  onTableSearch(term: string): void {
    this.searchTerm = term;
  }

  onTableRefresh(): void {
    this.loadLocations();
  }

  onTableAdd(): void {
    this.openAddModal();
  }

  onTablePageChange(page: number): void {
    this.currentPage = page;
  }

  onTablePageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  onTableActionClick(event: { action: string; item: any }): void {
    const item = event.item as Location;
    switch (event.action) {
      case 'edit':
        this.openEditModal(item);
        break;
      case 'delete':
        this.openDeleteModal(item);
        break;
      case 'toggle':
        this.toggleStatus(item);
        break;
      case 'download':
        this.downloadTemplate(item);
        break;
    }
  }

  // CRUD
  saveLocation(): void {
    if (!this.formData.nameEn?.trim()) {
      this.toastr.error('Name (EN) is required', 'Validation');
      return;
    }
    this.saving = true;
    if (this.isEditing && this.locationToEdit) {
      this.locationService
        .update(this.locationToEdit.id, this.formData)
        .subscribe({
          next: () => {
            this.toastr.success('Location updated', 'Success');
            this.closeModal();
            this.loadLocations();
            this.saving = false;
          },
          error: () => {
            this.toastr.error('Update failed', 'Error');
            this.saving = false;
          },
        });
    } else {
      this.locationService.create(this.formData).subscribe({
        next: () => {
          this.toastr.success('Location created', 'Success');
          this.closeModal();
          this.loadLocations();
          this.saving = false;
        },
        error: () => {
          this.toastr.error('Create failed', 'Error');
          this.saving = false;
        },
      });
    }
  }

  private buildFileUrl(relativeOrAbsolute?: string): string {
    if (!relativeOrAbsolute) return '';
    if (relativeOrAbsolute.startsWith('http')) return relativeOrAbsolute;
    return `${environment.imageBaseUrl}${relativeOrAbsolute}`;
  }

  downloadTemplate(item: Location): void {
    const url = this.buildFileUrl(item.templateUrl);
    if (url) {
      window.open(url, '_blank');
    } else {
      this.toastr.error('No template available', 'Error');
    }
  }

  toggleStatus(item: Location): void {
    this.locationService.toggleStatus(item.id).subscribe({
      next: () => {
        this.toastr.success('Status updated', 'Success');
        this.loadLocations();
      },
      error: () => this.toastr.error('Toggle failed', 'Error'),
    });
  }

  deleteLocation(): void {
    if (!this.locationToDelete) return;
    this.deleting = true;
    this.locationService.delete(this.locationToDelete.id).subscribe({
      next: () => {
        this.toastr.success('Location deleted', 'Success');
        this.closeDeleteModal();
        this.loadLocations();
        this.deleting = false;
      },
      error: () => {
        this.toastr.error('Delete failed', 'Error');
        this.deleting = false;
      },
    });
  }

  // Modals
  openAddModal(): void {
    this.isEditing = false;
    this.formData = {
      nameEn: '',
      nameAr: '',
      addressEn: '',
      addressAr: '',
      city: '',
      country: '',
      category: LocationCategory.OnSite,
      isActive: true,
    };
    this.showModal = true;
  }

  openEditModal(item: Location): void {
    this.isEditing = true;
    this.locationToEdit = item;
    this.formData = {
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      addressEn: item.addressEn,
      addressAr: item.addressAr,
      city: item.city,
      country: item.country,
      category: item.category,
      isActive: item.isActive,
    };
    this.showModal = true;
  }

  openDeleteModal(item: Location): void {
    this.locationToDelete = item;
    this.showDeleteModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.locationToEdit = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.locationToDelete = null;
  }

  private getCategoryKey(category: LocationCategory): string {
    switch (category) {
      case LocationCategory.OnSite:
        return 'locations.categories.onSite';
      case LocationCategory.OutSite:
        return 'locations.categories.outSite';
      case LocationCategory.OnlineVideo:
        return 'locations.categories.onlineVideo';
      case LocationCategory.Abroad:
        return 'locations.categories.abroad';
      default:
        return 'locations.category';
    }
  }
}
