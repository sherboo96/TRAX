import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../../locale/translation.pipe';

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  total: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-700">
          {{ 'dataTable.footer.showing' | translate }} {{ startItem }}
          {{ 'dataTable.footer.to' | translate }} {{ endItem }}
          {{ 'dataTable.footer.of' | translate }} {{ pagination.total }}
          {{ 'dataTable.footer.entries' | translate }}
        </span>
        <select
          (change)="onPageSizeChange($event)"
          [value]="pagination.pageSize"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="10">
            10 {{ 'dataTable.footer.perPage' | translate }}
          </option>
          <option value="25">
            25 {{ 'dataTable.footer.perPage' | translate }}
          </option>
          <option value="50">
            50 {{ 'dataTable.footer.perPage' | translate }}
          </option>
          <option value="100">
            100 {{ 'dataTable.footer.perPage' | translate }}
          </option>
        </select>
      </div>

      <div class="flex justify-center items-center">
        <nav class="flex items-center gap-3 bg-white rounded-xl">
          <button
            class="px-4 py-2 text-sm font-semibold text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:from-gray-100 hover:to-gray-200 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            [disabled]="pagination.currentPage === 1"
            (click)="previousPage()"
          >
            <svg
              class="w-4 h-4 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            {{ 'dataTable.footer.prevPage' | translate }}
          </button>

          <div class="flex items-center gap-2">
            <button
              *ngFor="let page of getPageNumbers()"
              class="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              [class]="
                page === pagination.currentPage
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:from-gray-100 hover:to-gray-200 hover:text-gray-800'
              "
              (click)="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="px-4 py-2 text-sm font-semibold text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:from-gray-100 hover:to-gray-200 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            [disabled]="pagination.currentPage === totalPages"
            (click)="nextPage()"
          >
            {{ 'dataTable.footer.nextPage' | translate }}
            <svg
              class="w-4 h-4 ml-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </nav>
      </div>
    </div>
  `,
  styles: [],
})
export class PaginationComponent {
  @Input() pagination!: PaginationInfo;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.pagination.total / this.pagination.pageSize);
  }

  get startItem(): number {
    return (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(
      this.pagination.currentPage * this.pagination.pageSize,
      this.pagination.total
    );
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(
      1,
      this.pagination.currentPage - Math.floor(maxPages / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  previousPage(): void {
    if (this.pagination.currentPage > 1) {
      this.pageChange.emit(this.pagination.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.pagination.currentPage < this.totalPages) {
      this.pageChange.emit(this.pagination.currentPage + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: any): void {
    const newPageSize = parseInt(event.target.value);
    this.pageSizeChange.emit(newPageSize);
  }
}
