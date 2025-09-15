import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { UserAdminService } from '../../../../core/services/user-admin.service';
import { ToastrService } from 'ngx-toastr';
import { User, UserRole } from '../../../../core/models/user.model';
import {
  UserAdmin,
  CreateUserAdminDto,
  UpdateUserAdminDto,
} from '../../../../core/models/user-admin.model';
import { PaginationRequest } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingComponent,
    ModalComponent,
  ],
})
export class AdminUsersComponent implements OnInit {
  currentUser: User | null = null;
  users: UserAdmin[] = [];
  loading = false;
  saving = false;
  deleting = false;

  // Math property for template
  Math = Math;

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
  formData: CreateUserAdminDto = {
    fullNameEn: '',
    fullNameAr: '',
    adUserName: '',
    email: '',
    civilNo: '',
    phoneNumber: '',
  };

  // Delete confirmation
  userToDelete: UserAdmin | null = null;
  userToEdit: UserAdmin | null = null;

  constructor(
    private authService: AuthService,
    private userAdminService: UserAdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadUsers();
  }

  get isAdmin(): boolean {
    return this.currentUser?.roleId === UserRole.ADMIN;
  }

  private loadUsers(): void {
    this.loading = true;

    const paginationRequest: PaginationRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      order: 'ASC',
      sortBy: 'id',
    };

    this.userAdminService.getUsers(paginationRequest).subscribe({
      next: (response) => {
        if (response.statusCode == 200) {
          this.users = response.result;
          console.log(this.users);
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
            response.message || 'Failed to load users',
            'Error'
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      },
    });
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.userToEdit = null;
    this.formData = {
      fullNameEn: '',
      fullNameAr: '',
      adUserName: '',
      email: '',
      civilNo: '',
      phoneNumber: '',
      roleId: 1,
    };
    this.showModal = true;
  }

  openEditModal(user: UserAdmin): void {
    this.isEditing = true;
    this.userToEdit = user;
    this.formData = {
      fullNameEn: user.fullNameEn,
      fullNameAr: user.fullNameAr,
      adUserName: user.adUserName,
      email: user.email,
      civilNo: user.civilNo,
      phoneNumber: user.phoneNumber,
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.userToEdit = null;
    this.formData = {
      fullNameEn: '',
      fullNameAr: '',
      adUserName: '',
      email: '',
      civilNo: '',
      phoneNumber: '',
    };
  }

  saveUser(): void {
    if (!this.formData.fullNameEn.trim() && !this.formData.fullNameAr.trim()) {
      this.toastr.error('User name is required', 'Validation Error');
      return;
    }

    this.saving = true;

    if (this.isEditing && this.userToEdit) {
      // Update user
      this.userAdminService
        .updateUser(this.userToEdit.id, this.formData as UpdateUserAdminDto)
        .subscribe({
          next: (user) => {
            this.toastr.success('User updated successfully', 'Success');
            this.closeModal();
            this.loadUsers();
            this.saving = false;
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.saving = false;
          },
        });
    } else {
      // Create user
      this.userAdminService.createUser(this.formData).subscribe({
        next: (user) => {
          this.toastr.success('User created successfully', 'Success');
          this.closeModal();
          this.loadUsers();
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.saving = false;
        },
      });
    }
  }

  openDeleteModal(user: UserAdmin): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.deleting = true;
    this.userAdminService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.toastr.success('User deleted successfully', 'Success');
        this.closeDeleteModal();
        this.loadUsers();
        this.deleting = false;
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.deleting = false;
      },
    });
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadUsers();
  }

  getEndItemNumber(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  // User image methods
  getUserInitials(user: UserAdmin): string {
    const name = user.fullNameEn || user.fullNameAr || '';
    if (!name.trim()) return '?';

    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  }

  onImageError(event: any, user: UserAdmin): void {
    // Mark the user as having an image error
    user.imageError = true;
  }

  onImageLoad(event: any, user: UserAdmin): void {
    // Mark the user image as loaded
    user.imageLoaded = true;
  }

  getOptimizedImageUrl(userPic: string | number[]): string {
    if (!userPic) return '';

    // If it's already a string (URL or data URL), return as is
    if (typeof userPic === 'string') {
      if (
        userPic.startsWith('data:') ||
        userPic.includes('thumb') ||
        userPic.includes('small')
      ) {
        return userPic;
      }
      return userPic;
    }

    // If it's a byte array (number[]), convert to base64 data URL
    if (Array.isArray(userPic)) {
      // For large byte arrays, we'll handle optimization in the template
      // For now, return the basic conversion
      return this.convertByteArrayToDataUrl(userPic);
    }

    return '';
  }

  convertByteArrayToDataUrl(byteArray: number[]): string {
    try {
      // Convert number array to Uint8Array
      const uint8Array = new Uint8Array(byteArray);

      // Detect image format from byte array
      const mimeType = this.detectImageFormat(uint8Array);

      // Convert to base64
      const base64 = btoa(String.fromCharCode(...uint8Array));

      // Return as data URL with detected format
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Error converting byte array to data URL:', error);
      return '';
    }
  }

  detectImageFormat(uint8Array: Uint8Array): string {
    // Check for common image format signatures
    if (uint8Array.length < 4) return 'image/jpeg'; // Default fallback

    // PNG signature: 89 50 4E 47
    if (
      uint8Array[0] === 0x89 &&
      uint8Array[1] === 0x50 &&
      uint8Array[2] === 0x4e &&
      uint8Array[3] === 0x47
    ) {
      return 'image/png';
    }

    // JPEG signature: FF D8 FF
    if (
      uint8Array[0] === 0xff &&
      uint8Array[1] === 0xd8 &&
      uint8Array[2] === 0xff
    ) {
      return 'image/jpeg';
    }

    // GIF signature: 47 49 46 38
    if (
      uint8Array[0] === 0x47 &&
      uint8Array[1] === 0x49 &&
      uint8Array[2] === 0x46 &&
      uint8Array[3] === 0x38
    ) {
      return 'image/gif';
    }

    // WebP signature: 52 49 46 46 ... 57 45 42 50
    if (
      uint8Array.length >= 12 &&
      uint8Array[0] === 0x52 &&
      uint8Array[1] === 0x49 &&
      uint8Array[2] === 0x46 &&
      uint8Array[3] === 0x46 &&
      uint8Array[8] === 0x57 &&
      uint8Array[9] === 0x45 &&
      uint8Array[10] === 0x42 &&
      uint8Array[11] === 0x50
    ) {
      return 'image/webp';
    }

    // Default to JPEG if format cannot be detected
    return 'image/jpeg';
  }

  // Method to handle image resizing on the client side if needed
  async resizeImageIfNeeded(
    dataUrl: string,
    maxWidth: number = 40,
    maxHeight: number = 40
  ): Promise<string> {
    try {
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return dataUrl;

      // Create an image element
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = () => {
          // Calculate new dimensions maintaining aspect ratio
          const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
          const newWidth = img.width * ratio;
          const newHeight = img.height * ratio;

          // Set canvas dimensions
          canvas.width = newWidth;
          canvas.height = newHeight;

          // Draw resized image
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Convert back to data URL
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(resizedDataUrl);
        };

        img.onerror = () => {
          resolve(dataUrl); // Return original if resizing fails
        };

        img.src = dataUrl;
      });
    } catch (error) {
      console.error('Error resizing image:', error);
      return dataUrl;
    }
  }

  // Method to optimize byte array images
  async optimizeByteArrayImage(byteArray: number[]): Promise<string> {
    try {
      // Convert to data URL first
      const dataUrl = this.convertByteArrayToDataUrl(byteArray);

      // If the byte array is large (> 50KB), resize it
      if (byteArray.length > 50000) {
        return await this.resizeImageIfNeeded(dataUrl, 40, 40);
      }

      return dataUrl;
    } catch (error) {
      console.error('Error optimizing byte array image:', error);
      return '';
    }
  }
}
