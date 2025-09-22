import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseRequestService } from '../../../../core/services/course-request.service';
import { CourseRequest } from '../../../../core/models/course-request.model';
import { PaginatedResult } from '../../../../core/models/pagination.model';
import { BaseResponse } from '../../../../core/models/base-response.model';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-requests.component.html',
  styleUrls: ['./admin-requests.component.css'],
})
export class AdminRequestsComponent implements OnInit {
  requests: CourseRequest[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Filters
  statusFilter = '';
  searchTerm = '';

  // Status options
  statusOptions = [
    { id: '', name: 'All Statuses' },
    { id: '1', name: 'Pending' },
    { id: '2', name: 'Approved' },
    { id: '3', name: 'Rejected' },
  ];

  constructor(
    @Inject(CourseRequestService)
    private courseRequestService: CourseRequestService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = null;

    this.courseRequestService
      .getRequestsForDepartment(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: BaseResponse<CourseRequest[]>) => {
          if (response.statusCode === 200 && response.result) {
            // Apply client-side filtering for status and search
            let filteredRequests = response.result;

            // Filter by status if selected
            if (this.statusFilter) {
              const statusId = parseInt(this.statusFilter);
              filteredRequests = filteredRequests.filter(
                (request: CourseRequest) => request.requestStatusId === statusId
              );
            }

            // Filter by search term if provided
            if (this.searchTerm && this.searchTerm.trim()) {
              const searchLower = this.searchTerm.toLowerCase();
              filteredRequests = filteredRequests.filter(
                (request: CourseRequest) =>
                  request.userFullNameEn.toLowerCase().includes(searchLower) ||
                  request.courseTitle.toLowerCase().includes(searchLower) ||
                  request.departmentNameEn.toLowerCase().includes(searchLower)
              );
            }

            this.requests = filteredRequests;
            this.totalCount = filteredRequests.length;
            this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Failed to load requests';
          this.loading = false;
          console.error('Error loading requests:', error);
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRequests();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  approveRequest(requestId: number): void {
    if (confirm('Are you sure you want to approve this request?')) {
      this.courseRequestService
        .approveRequest(requestId, { requestStatusId: 2 })
        .subscribe({
          next: (response: BaseResponse<string>) => {
            if (response.statusCode === 200) {
              this.loadRequests();
            } else {
              this.error = response.message || 'Failed to approve request';
            }
          },
          error: (error: any) => {
            this.error = 'Failed to approve request';
            console.error('Error approving request:', error);
          },
        });
    }
  }

  rejectRequest(requestId: number): void {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && reason.trim()) {
      this.courseRequestService
        .rejectRequest(requestId, {
          requestStatusId: 3,
          rejectionReason: reason.trim(),
        })
        .subscribe({
          next: (response: BaseResponse<string>) => {
            if (response.statusCode === 200) {
              this.loadRequests();
            } else {
              this.error = response.message || 'Failed to reject request';
            }
          },
          error: (error: any) => {
            this.error = 'Failed to reject request';
            console.error('Error rejecting request:', error);
          },
        });
    }
  }

  getStatusClass(statusId: number): string {
    switch (statusId) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusName(statusId: number): string {
    const status = this.statusOptions.find((s) => s.id === statusId.toString());
    return status ? status.name : 'Unknown';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
  }

  getPages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }
}
