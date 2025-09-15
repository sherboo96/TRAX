import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import {
  TableComponent,
  TableColumn,
} from '../../../../shared/components/table/table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { RoleService } from '../../../../core/services/role.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ToastrService } from 'ngx-toastr';
import { User, UserRole } from '../../../../core/models/user.model';
import {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from '../../../../core/models/role.model';
import { Permission } from '../../../../core/models/permission.model';

@Component({
  selector: 'app-admin-roles',
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingComponent,
    TableComponent,
    ModalComponent,
  ],
})
export class AdminRolesComponent implements OnInit {
  currentUser: User | null = null;
  roles: Role[] = [];
  permissions: Permission[] = [];
  loading = false;
  saving = false;
  deleting = false;
  loadingPermissions = false;

  // Modal states
  showModal = false;
  showDeleteModal = false;
  isEditing = false;

  // Form data
  formData: CreateRoleDto = {
    name: '',
    description: '',
    isActive: true,
    permissionIds: [],
  };

  // Delete confirmation
  roleToDelete: Role | null = null;
  roleToEdit: Role | null = null;

  // Table configuration
  tableColumns: TableColumn[] = [];

  // Permission modal state
  showPermissionsModal = false;
  permissionsRole: Role | null = null;
  updatingPermissions = new Set<string>(); // Track which permissions are being updated

  tableActions = [
    {
      name: 'edit',
      svg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path>
      </svg>`,
      class: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
    },
    {
      name: 'delete',
      svg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
      </svg>`,
      class: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    },
  ];

  @ViewChild('roleNameTemplate', { static: true })
  roleNameTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true })
  statusTemplate!: TemplateRef<any>;
  @ViewChild('permissionsTemplate', { static: true })
  permissionsTemplate!: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadRoles();
    this.loadPermissions();

    // Initialize table columns after templates are available
    this.tableColumns = [
      {
        header: 'Role',
        field: 'name',
        cellTemplate: this.roleNameTemplate,
      },
      { header: 'Description', field: 'description' },
      {
        header: 'Permissions',
        field: 'rolePermissions',
        cellTemplate: this.permissionsTemplate,
      },
      {
        header: 'Status',
        field: 'isActive',
        cellTemplate: this.statusTemplate,
      },
    ];
  }

  get isAdmin(): boolean {
    return this.currentUser?.roleId === UserRole.ADMIN;
  }

  private loadRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (response) => {
        if (response.success) {
          this.roles = response.result;
        } else {
          this.toastr.error(
            response.message || 'Failed to load roles',
            'Error'
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.loading = false;
      },
    });
  }

  refreshRoles(): void {
    this.loadRoles();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.roleToEdit = null;
    this.formData = {
      name: '',
      description: '',
      isActive: true,
      permissionIds: [],
    };
    this.showModal = true;
  }

  openEditModal(role: Role): void {
    this.isEditing = true;
    this.roleToEdit = role;
    this.formData = {
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      permissionIds: role.rolePermissions
        .filter((rp) => rp.isGranted)
        .map((rp) => rp.permissionId),
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.roleToEdit = null;
    this.formData = {
      name: '',
      description: '',
      isActive: true,
      permissionIds: [],
    };
  }

  saveRole(): void {
    if (!this.formData.name.trim()) {
      this.toastr.error('Role name is required', 'Validation Error');
      return;
    }

    this.saving = true;

    if (this.isEditing && this.roleToEdit) {
      // Update role
      this.roleService
        .updateRole(this.roleToEdit.id, this.formData as UpdateRoleDto)
        .subscribe({
          next: (role) => {
            this.toastr.success('Role updated successfully', 'Success');
            this.closeModal();
            this.loadRoles();
            this.saving = false;
          },
          error: (error) => {
            console.error('Error updating role:', error);
            this.saving = false;
          },
        });
    } else {
      // Create role
      this.roleService.createRole(this.formData).subscribe({
        next: (role) => {
          this.toastr.success('Role created successfully', 'Success');
          this.closeModal();
          this.loadRoles();
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating role:', error);
          this.saving = false;
        },
      });
    }
  }

  openDeleteModal(role: Role): void {
    this.roleToDelete = role;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.roleToDelete = null;
  }

  confirmDelete(): void {
    if (!this.roleToDelete) return;

    this.deleting = true;
    this.roleService.deleteRole(this.roleToDelete.id).subscribe({
      next: () => {
        this.toastr.success('Role deleted successfully', 'Success');
        this.closeDeleteModal();
        this.loadRoles();
        this.deleting = false;
      },
      error: (error) => {
        console.error('Error deleting role:', error);
        this.deleting = false;
      },
    });
  }

  onTableAction(event: { name: string; row: any }): void {
    const role = event.row as Role;

    switch (event.name) {
      case 'edit':
        this.openEditModal(role);
        break;
      case 'delete':
        this.openDeleteModal(role);
        break;
    }
  }

  getGrantedPermissionsCount(role: Role): number {
    return role.rolePermissions.filter((rp) => rp.isGranted).length;
  }

  getTotalPermissionsCount(role: Role): number {
    return role.rolePermissions.length;
  }

  getGrantedPermissionNames(role: Role): string {
    return role.rolePermissions
      .filter((rp) => rp.isGranted)
      .slice(0, 3)
      .map((rp) => rp.permissionName)
      .join(', ');
  }

  openPermissionsModal(role: Role): void {
    this.permissionsRole = role;
    this.showPermissionsModal = true;
  }

  closePermissionsModal(): void {
    this.showPermissionsModal = false;
    this.permissionsRole = null;
  }

  togglePermission(role: Role, permissionId: number, isGranted: boolean): void {
    const permissionKey = `${role.id}-${permissionId}`;

    if (this.updatingPermissions.has(permissionKey)) {
      return; // Prevent multiple simultaneous updates
    }

    this.updatingPermissions.add(permissionKey);

    const apiCall = isGranted
      ? this.roleService.revokePermission(role.id, permissionId)
      : this.roleService.grantPermission(role.id, permissionId);

    apiCall.subscribe({
      next: (response) => {
        // Update the local role data
        const rolePermission = role.rolePermissions.find(
          (rp) => rp.permissionId === permissionId
        );
        if (rolePermission) {
          rolePermission.isGranted = !isGranted;
        }

        this.toastr.success(
          `Permission ${isGranted ? 'revoked' : 'granted'} successfully`,
          'Success'
        );
        this.updatingPermissions.delete(permissionKey);
      },
      error: (error) => {
        console.error('Error updating permission:', error);
        this.toastr.error(
          `Failed to ${isGranted ? 'revoke' : 'grant'} permission`,
          'Error'
        );
        this.updatingPermissions.delete(permissionKey);
      },
    });
  }

  isUpdatingPermission(role: Role, permissionId: number): boolean {
    return this.updatingPermissions.has(`${role.id}-${permissionId}`);
  }

  private loadPermissions(): void {
    this.loadingPermissions = true;
    this.permissionService.getPermissions().subscribe({
      next: (response) => {
        if (response.success) {
          this.permissions = response.result;
        } else {
          this.toastr.error(
            response.message || 'Failed to load permissions',
            'Error'
          );
        }
        this.loadingPermissions = false;
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.loadingPermissions = false;
      },
    });
  }

  togglePermissionSelection(permissionId: number): void {
    const index = this.formData.permissionIds.indexOf(permissionId);
    if (index > -1) {
      this.formData.permissionIds.splice(index, 1);
    } else {
      this.formData.permissionIds.push(permissionId);
    }
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.formData.permissionIds.includes(permissionId);
  }
}
