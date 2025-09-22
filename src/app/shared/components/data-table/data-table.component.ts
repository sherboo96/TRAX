import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'avatar' | 'actions' | 'status' | 'date';
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  label: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  action: string;
  show?: (item: any) => boolean;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DataTableComponent implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'No data found';
  @Input() emptyIcon: string = 'fas fa-inbox';
  @Input() actions: TableAction[] = [];
  @Input() pagination: PaginationInfo | null = null;
  @Input() searchTerm: string = '';
  @Input() showSearch: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() showRefresh: boolean = true;
  @Input() title: string = '';
  @Input() subtitle: string = '';

  @Output() sort = new EventEmitter<{
    field: string;
    direction: 'asc' | 'desc';
  }>();
  @Output() search = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() actionClick = new EventEmitter<{ action: string; item: any }>();

  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    // Initialize sort field from first sortable column
    const firstSortableColumn = this.columns.find((col) => col.sortable);
    if (firstSortableColumn) {
      this.sortField = firstSortableColumn.key;
    }
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sort.emit({ field: this.sortField, direction: this.sortDirection });
  }

  onSearch(): void {
    this.search.emit(this.searchTerm);
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  onAdd(): void {
    this.add.emit();
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onPageSizeChange(newPageSize: any): void {
    this.pageSizeChange.emit(+newPageSize);
  }

  onActionClick(action: string, item: any): void {
    this.actionClick.emit({ action, item });
  }

  getActionColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      primary:
        'border-primary-600 text-primary-600 hover:bg-primary-600 focus:ring-primary-600',
      secondary:
        'border-gray-600 text-gray-600 hover:bg-gray-600 focus:ring-gray-600',
      success:
        'border-green-600 text-green-600 hover:bg-green-600 focus:ring-green-600',
      warning:
        'border-yellow-600 text-yellow-600 hover:bg-yellow-600 focus:ring-yellow-600',
      danger: 'border-red-600 text-red-600 hover:bg-red-600 focus:ring-red-600',
      info: 'border-blue-600 text-blue-600 hover:bg-blue-600 focus:ring-blue-600',
    };
    return colorMap[color] || colorMap['primary'];
  }

  getPaginationRange(): number[] {
    if (!this.pagination) return [];

    const range = [];
    const start = Math.max(1, this.pagination.currentPage - 2);
    const end = Math.min(
      this.pagination.totalPages,
      this.pagination.currentPage + 2
    );

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  getCellValue(item: any, column: TableColumn): any {
    const keys = column.key.split('.');
    let value = item;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  getAvatarText(item: any, column: TableColumn): string {
    const value = this.getCellValue(item, column);
    if (typeof value === 'string' && value.length > 0) {
      return value.charAt(0).toUpperCase();
    }
    return '?';
  }

  formatDate(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }

  getStatusClass(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue.includes('active') || lowerValue.includes('enabled')) {
        return 'bg-green-100 text-green-800';
      }
      if (lowerValue.includes('inactive') || lowerValue.includes('disabled')) {
        return 'bg-red-100 text-red-800';
      }
      if (lowerValue.includes('pending')) {
        return 'bg-yellow-100 text-yellow-800';
      }
    }
    return 'bg-gray-100 text-gray-800';
  }

  getImageUrl(photoUrl: string): string {
    if (photoUrl) {
      // If it's already a full URL, return as is
      if (photoUrl.startsWith('http')) {
        return photoUrl;
      }
      // Otherwise, prepend the API base URL
      return `${environment.imageBaseUrl}${photoUrl}`;
    }
    return '';
  }

  onImageError(event: any): void {
    // Hide the image and show initials instead
    event.target.style.display = 'none';
  }

  Math = Math;
}
