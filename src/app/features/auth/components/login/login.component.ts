import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserTypeModalComponent } from '../../../../shared/components/user-type-modal/user-type-modal.component';
import { User, UserRole } from '../../../../core/models/user.model';
import { APP_CONSTANTS } from '../../../../core/constants/app.constants';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../../../locale/translation.service';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import { SupportedLanguage } from '../../../../../locale/translation.types';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UserTypeModalComponent,
    TranslatePipe,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
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
  // Translation properties
  currentLanguage: SupportedLanguage = 'en';
  isRTL = false;
  supportedLanguages: SupportedLanguage[] = [];
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translationService: TranslationService
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

  ngOnInit(): void {
    // Initialize translation properties
    this.supportedLanguages = this.translationService.getSupportedLanguages();
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.isRTL = this.translationService.isRTL();

    // Subscribe to language changes
    this.subscription.add(
      this.translationService.getCurrentLanguage$().subscribe((language) => {
        this.currentLanguage = language;
        this.isRTL = this.translationService.isRTL();
      })
    );
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
      return this.translationService.translate(
        `login.form.${fieldName}.errors.required`
      );
    }
    if (control.errors['minlength']) {
      return this.translationService.translate(
        `login.form.${fieldName}.errors.minlength`
      );
    }
    if (control.errors['maxlength']) {
      return this.translationService.translate(
        `login.form.${fieldName}.errors.maxlength`
      );
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
            error.error?.message ||
            this.translationService.translate('login.form.loginError');
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

  // Language switching methods
  switchLanguage(language: SupportedLanguage): void {
    this.translationService.setLanguage(language);
  }

  getLanguageDisplayName(language: SupportedLanguage): string {
    return language === 'en' ? 'English' : 'العربية';
  }
}
