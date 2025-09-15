import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-type-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal
      [show]="show"
      title="Select User Type"
      (close)="onCancel()"
      [width]="'w-full max-w-md'"
    >
      <div class="space-y-6">
        <!-- Header -->
        <div class="text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4"
          >
            <svg
              class="h-6 w-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Welcome to OTC</h3>
          <p class="text-sm text-gray-500">
            Please select your user type to continue. This will help us provide
            you with the appropriate access and features.
          </p>
        </div>

        <!-- User Type Options -->
        <div class="space-y-3">
          <div
            *ngFor="let option of userTypeOptions"
            class="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-primary-300 hover:bg-primary-50"
            [class.border-primary-500]="selectedUserType === option.value"
            [class.bg-primary-50]="selectedUserType === option.value"
            (click)="selectUserType(option.value)"
          >
            <input
              type="radio"
              [id]="'userType-' + option.value"
              name="userType"
              [value]="option.value"
              [(ngModel)]="selectedUserType"
              class="sr-only"
            />
            <div
              class="flex items-center justify-center h-5 w-5 rounded-full border-2 mr-3"
              [class.border-primary-500]="selectedUserType === option.value"
              [class.border-gray-300]="selectedUserType !== option.value"
            >
              <div
                *ngIf="selectedUserType === option.value"
                class="h-2.5 w-2.5 rounded-full bg-primary-500"
              ></div>
            </div>
            <div class="flex items-center">
              <div class="text-2xl mr-3">{{ option.icon }}</div>
              <div>
                <label
                  [for]="'userType-' + option.value"
                  class="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {{ option.label }}
                </label>
                <p class="text-xs text-gray-500 mt-1">
                  {{ option.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          *ngIf="errorMessage"
          class="text-sm text-red-600 bg-red-50 p-3 rounded-md"
        >
          {{ errorMessage }}
        </div>
      </div>

      <div modal-footer>
        <button
          type="button"
          (click)="onCancel()"
          class="inline-flex items-center px-4 py-2.5 border border-neutral-300 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="button"
          (click)="onConfirm()"
          [disabled]="!selectedUserType || loading"
          class="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span *ngIf="loading" class="inline-flex items-center">
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
          <span *ngIf="!loading">Continue</span>
        </button>
      </div>
    </app-modal>
  `,
  styles: [],
})
export class UserTypeModalComponent {
  @Input() show = false;
  @Input() loading = false;
  @Output() confirm = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();

  selectedUserType: number | null = null;
  errorMessage = '';

  userTypeOptions = [
    {
      value: UserRole.USER,
      label: 'Regular User',
      description: 'Access to courses, dashboard, and basic features',
      icon: '👤',
    },
    {
      value: UserRole.ADMIN,
      label: 'Administrator',
      description: 'Full access to all system features and management',
      icon: '⚙️',
    },
    {
      value: UserRole.MODERATOR,
      label: 'Moderator',
      description: 'Limited administrative access and content management',
      icon: '🛡️',
    },
  ];

  selectUserType(userType: number): void {
    this.selectedUserType = userType;
    this.errorMessage = '';
  }

  onConfirm(): void {
    if (!this.selectedUserType) {
      this.errorMessage = 'Please select a user type to continue.';
      return;
    }
    this.confirm.emit(this.selectedUserType);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
