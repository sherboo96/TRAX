import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserTypeModalComponent } from '../../../../shared/components/user-type-modal/user-type-modal.component';
import { User, UserRole } from '../../../../core/models/user.model';
import { APP_CONSTANTS } from '../../../../core/constants/app.constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserTypeModalComponent],
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  formSubmitted = false;
  currentYear = new Date().getFullYear();
  currentUser: User | null = null;
  appConstants = APP_CONSTANTS;
  // User type modal state
  showUserTypeModal = false;
  userTypeModalLoading = false;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      civilNo: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(12),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    // Subscribe to user type modal state
    // this.subscription.add(
    //   this.authService.showUserTypeModal$.subscribe((show) => {
    //     // Only show modal if user is admin type and modal should be shown

    //   })
    // );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get civilNoControl(): AbstractControl | null {
    return this.loginForm.get('civilNo');
  }

  get passwordControl(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  hasError(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(
      control &&
      control.invalid &&
      (control.touched || this.formSubmitted)
    );
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return `${
        fieldName === 'civilNo' ? 'Civil number' : 'Password'
      } is required`;
    }
    if (control.errors['minlength']) {
      if (fieldName === 'civilNo') {
        return 'Civil number must be 12 digits';
      }
      return 'Password must be at least 6 characters';
    }
    if (control.errors['maxlength']) {
      return 'Civil number must be 12 digits';
    }

    return 'Invalid input';
  }

  onLogin(): void {
    this.formSubmitted = true;

    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      console.log('Submitting login form:', this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.currentUser = response.result.user;
          console.log('Login successful, response:', response);
          this.loading = false;

          if (this.currentUser?.userType === 1) {
            this.showUserTypeModal = true;
          } else {
            this.onUserTypeConfirm(UserRole.USER);
          }
          // If user has a roleId, navigate to dashboard
          if (response.result.user.roleId) {
            const dashboardRoute = this.authService.getDashboardRoute();
            this.router.navigate([dashboardRoute]);
          }
          // If no roleId, the user type modal will be shown automatically
        },
        error: (error) => {
          console.error('Login error in component:', error);
          this.loading = false;
          this.errorMessage =
            error.error?.message || 'Login failed. Please try again.';
        },
      });
    } else {
      console.log('Form is invalid:', this.loginForm.errors);
    }
  }

  // Handle user type selection
  onUserTypeConfirm(userType: UserRole): void {
    this.userTypeModalLoading = true;
    this.showUserTypeModal = false;

    // Set the user type in the auth service
    this.authService.setUserType(userType);

    // Navigate to appropriate dashboard
    const dashboardRoute = this.authService.getDashboardRoute();
    this.router.navigate([dashboardRoute]);

    this.userTypeModalLoading = false;
  }

  // Handle user type modal cancel
  onUserTypeCancel(): void {
    this.authService.closeUserTypeModal();
    // Optionally log out the user since they didn't complete the setup
    this.authService.logout();
  }

  // Keep the old method for backward compatibility
  onSubmit(): void {
    this.onLogin();
  }
}
