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
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import {
  DataTableComponent,
  TableColumn,
  TableAction,
  PaginationInfo,
} from '../../../../shared/components/data-table/data-table.component';
import { DepartmentTreeNodeComponent } from '../../../../shared/components/department-tree-node/department-tree-node.component';
import { DepartmentTreeVisualizerComponent } from '../../../../shared/components/department-tree-visualizer/department-tree-visualizer.component';
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
import { DepartmentTreeNode } from '../../../../core/models/department-tree.model';
import { Organization } from '../../../../core/models/organization.model';
import { PaginationRequest } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-admin-departments',
  templateUrl: './admin-departments.component.html',
  styleUrls: ['./admin-departments.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ModalComponent,
    DataTableComponent,
    DepartmentTreeNodeComponent,
    DepartmentTreeVisualizerComponent,
  ],
})
export class AdminDepartmentsComponent implements OnInit, AfterViewInit {
  currentUser: User | null = null;
  departments: Department[] = [];
  departmentTree: DepartmentTreeNode[] = [];
  organizations: Organization[] = [];
  loading = false;
  saving = false;
  deleting = false;

  // Complete tree visualization properties
  completeTreeData: any = null;
  rootDepartment: any = null;
  treeNodes: any[] = [];
  totalNodes: number = 0;
  maxDepth: number = 0;
  activeCount: number = 0;
  inactiveCount: number = 0;

  // View mode toggle
  viewMode: 'table' | 'tree' | 'complete-tree' = 'table';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Search and sorting properties
  searchTerm: string = '';
  sortField: string = 'nameEn';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Table configuration
  tableColumns: TableColumn[] = [
    {
      key: 'nameEn',
      label: 'Department',
      sortable: true,
      type: 'text',
      width: '25%',
    },
    {
      key: 'nameAr',
      label: 'Arabic Name',
      sortable: true,
      type: 'text',
      width: '20%',
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      type: 'text',
      width: '15%',
    },
    {
      key: 'mainType',
      label: 'Main Type',
      sortable: true,
      type: 'text',
      width: '15%',
    },
    {
      key: 'organizationName',
      label: 'Organization',
      sortable: false,
      type: 'text',
      width: '15%',
    },
    {
      key: 'statusDisplay',
      label: 'Status',
      sortable: true,
      type: 'status',
      width: '10%',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      type: 'actions',
      align: 'right',
      width: '10%',
    },
  ];

  tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      color: 'info',
      action: 'edit',
    },
    {
      label: 'Delete',
      icon: 'fas fa-trash',
      color: 'danger',
      action: 'delete',
    },
  ];

  paginationInfo: PaginationInfo | null = null;

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
            this.departments = response.result.map((dept: any) => ({
              ...dept,
              organizationName: this.getOrganizationName(dept.organizationId),
              statusDisplay: this.getStatusDisplay(dept.isActive),
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
    if (!this.formData.nameEn.trim() && !this.formData.nameAr?.trim()) {
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

  // Data table event handlers
  onTableSort(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField = event.field;
    this.sortDirection = event.direction;
    this.currentPage = 1;
    this.loadDepartments();
  }

  onTableSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadDepartments();
  }

  onTableRefresh(): void {
    this.loadDepartments();
  }

  onTableAdd(): void {
    this.openAddModal();
  }

  onTablePageChange(page: number): void {
    this.currentPage = page;
    this.loadDepartments();
  }

  onTablePageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.loadDepartments();
  }

  onTableActionClick(event: { action: string; item: any }): void {
    const department = event.item as Department;

    switch (event.action) {
      case 'edit':
        this.openEditModal(department);
        break;
      case 'delete':
        this.openDeleteModal(department);
        break;
    }
  }

  openAddModal(): void {
    this.isEditing = false;
    this.formData = {
      nameEn: '',
      nameAr: '',
      type: 'Dep',
      mainType: 'D',
      organizationId: 0,
    };
    this.showModal = true;
  }

  // Helper method for data table to display organization name
  getOrganizationName(organizationId: number): string {
    const organization = this.organizations.find(
      (org) => org.id === organizationId
    );
    return organization ? this.getOrganizationDisplayName(organization) : 'N/A';
  }

  // Helper method for data table to display status
  getStatusDisplay(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  // Tree view methods
  toggleViewMode(): void {
    if (this.viewMode === 'table') {
      this.viewMode = 'tree';
      this.loadDepartmentTree();
    } else if (this.viewMode === 'tree') {
      this.viewMode = 'complete-tree';
      this.loadCompleteTree();
    } else {
      this.viewMode = 'table';
    }
  }

  loadCompleteTree(rootDepartmentId?: number): void {
    this.loading = true;
    this.departmentService
      .getCompleteDepartmentTree(rootDepartmentId)
      .subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            this.completeTreeData = response.result;

            if (rootDepartmentId) {
              // Single root department tree
              this.rootDepartment = this.completeTreeData.rootDepartment;
              this.treeNodes = this.completeTreeData.tree || [];
              this.totalNodes = this.completeTreeData.totalNodes || 0;
            } else {
              // Multiple root departments
              this.rootDepartment = null;
              this.treeNodes = this.completeTreeData.trees || [];
              this.totalNodes = this.completeTreeData.totalNodes || 0;
            }

            this.calculateTreeStats();
            console.log('Complete tree loaded:', this.completeTreeData);
          } else {
            this.toastr.error(
              response.message || 'Failed to load complete tree',
              'Error'
            );
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading complete tree:', error);
          this.loading = false;
        },
      });
  }

  calculateTreeStats(): void {
    this.maxDepth = 0;
    this.activeCount = 0;
    this.inactiveCount = 0;

    this.treeNodes.forEach((node) => {
      this.calculateNodeStats(node, 0);
    });
  }

  private calculateNodeStats(node: any, level: number): void {
    this.maxDepth = Math.max(this.maxDepth, level);

    if (node.isActive) {
      this.activeCount++;
    } else {
      this.inactiveCount++;
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        this.calculateNodeStats(child, level + 1);
      });
    }
  }

  loadDepartmentTree(): void {
    this.loading = true;
    this.departmentService.getDepartmentTree().subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.departmentTree = response.result;
          console.log('Department tree loaded:', this.departmentTree);
        } else {
          this.toastr.error(
            response.message || 'Failed to load department tree',
            'Error'
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading department tree:', error);
        this.loading = false;
      },
    });
  }

  toggleNode(node: DepartmentTreeNode): void {
    node.isExpanded = !node.isExpanded;
  }

  getNodeIcon(node: DepartmentTreeNode): string {
    if (node.hasChildren) {
      return node.isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
    }
    return 'fas fa-circle';
  }

  getNodeIndent(level: number): string {
    return `ml-${level * 4}`;
  }

  getNodeStatusClass(isActive: boolean): string {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  }

  getNodeTypeClass(type: string): string {
    const typeClasses: { [key: string]: string } = {
      Dep: 'text-blue-600 bg-blue-100',
      Div: 'text-purple-600 bg-purple-100',
      Sec: 'text-orange-600 bg-orange-100',
    };
    return typeClasses[type] || 'text-gray-600 bg-gray-100';
  }

  onTreeActionClick(action: string, node: DepartmentTreeNode): void {
    switch (action) {
      case 'edit':
        this.openEditModalFromTree(node);
        break;
      case 'delete':
        this.openDeleteModalFromTree(node);
        break;
    }
  }

  onTreeToggle(node: any): void {
    // Handle tree node toggle for complete tree view
    console.log('Tree node toggled:', node);
  }

  openEditModalFromTree(node: DepartmentTreeNode): void {
    this.isEditing = true;
    this.departmentToEdit = {
      id: node.id,
      nameEn: node.nameEn,
      nameAr: node.nameAr,
      type: node.type,
      mainType: node.mainType,
      baseDepartmentId: node.baseDepartmentId,
      organizationId: node.organizationId,
      orgRecordId: node.orgRecordId,
      kpiWeigth: node.kpiWeigth,
      isActive: node.isActive,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    } as Department;

    this.formData = {
      nameEn: node.nameEn,
      nameAr: node.nameAr,
      type: node.type,
      mainType: node.mainType,
      baseDepartmentId: node.baseDepartmentId,
      organizationId: node.organizationId,
      orgRecordId: node.orgRecordId,
    };
    this.showModal = true;
  }

  openDeleteModalFromTree(node: DepartmentTreeNode): void {
    this.departmentToDelete = {
      id: node.id,
      nameEn: node.nameEn,
      nameAr: node.nameAr,
      type: node.type,
      mainType: node.mainType,
      baseDepartmentId: node.baseDepartmentId,
      organizationId: node.organizationId,
      orgRecordId: node.orgRecordId,
      kpiWeigth: node.kpiWeigth,
      isActive: node.isActive,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    } as Department;
    this.showDeleteModal = true;
  }
}
