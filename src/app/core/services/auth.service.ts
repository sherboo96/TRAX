import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import {
  User,
  LoginRequest,
  LoginResponse,
  ApiLoginResponse,
  UserRole,
} from '../models/user.model';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // User type selection state
  private showUserTypeModalSubject = new BehaviorSubject<boolean>(false);
  public showUserTypeModal$ = this.showUserTypeModalSubject.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) {
    this.loadUserFromStorage();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get showUserTypeModal(): boolean {
    return this.showUserTypeModalSubject.value;
  }

  login(credentials: LoginRequest): Observable<ApiLoginResponse> {
    console.log('Login attempt with credentials:', credentials);

    return this.http
      .post<ApiLoginResponse>(
        `${APP_CONSTANTS.API_BASE_URL}/authentication/login`,
        credentials
      )
      .pipe(
        tap((response) => {
          console.log('Login successful:', response);
          this.setToken(response.result.token);

          // Always set the current user first
          this.setCurrentUser(response.result.user);

          // Check if user has a roleId, if not show user type modal
          if (!response.result.user.roleId) {
            this.showUserTypeModalSubject.next(true);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Login error:', error);
          this.handleLoginError(error);
          return throwError(() => error);
        })
      );
  }

  // Method to set user type after selection
  setUserType(userType: UserRole): void {
    const currentUser = this.currentUserValue;
    if (currentUser) {
      const updatedUser = { ...currentUser, roleId: userType };
      this.setCurrentUser(updatedUser);
      this.showUserTypeModalSubject.next(false);
    }
  }

  // Method to close user type modal
  closeUserTypeModal(): void {
    this.showUserTypeModalSubject.next(false);
  }

  private mockLogin(credentials: LoginRequest): Observable<ApiLoginResponse> {
    console.log('Using mock login for development');

    // Simulate API delay
    return of(null as any).pipe(
      tap((response) => {
        console.log('Mock login successful:', response);
        this.setToken(response.result.token);
      })
    );
  }

  private isDevelopmentMode(): boolean {
    return (
      !APP_CONSTANTS.API_BASE_URL ||
      APP_CONSTANTS.API_BASE_URL.includes('localhost') ||
      APP_CONSTANTS.API_BASE_URL.includes('127.0.0.1')
    );
  }

  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER_DATA);
    this.currentUserSubject.next(null);
    this.showUserTypeModalSubject.next(false);
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.getToken();
    console.log('Authentication check:', isAuth);
    return isAuth;
  }

  getToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
  }

  private setToken(token: string): void {
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, token);
    console.log('Token stored successfully');
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem(
      APP_CONSTANTS.STORAGE_KEYS.USER_DATA,
      JSON.stringify(user)
    );
    this.currentUserSubject.next(user);
    console.log('Current user set:', user);
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER_DATA);
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUserSubject.next(user);
      console.log('User loaded from storage:', user);
    }
  }

  // Method to get the appropriate dashboard route based on user role
  getDashboardRoute(): string {
    const user = this.currentUserValue;
    if (!user) {
      return APP_CONSTANTS.ROUTES.LOGIN;
    }

    switch (user.userType) {
      case UserRole.ADMIN:
        return APP_CONSTANTS.ROUTES.ADMIN_DASHBOARD;
      case UserRole.USER:
        return APP_CONSTANTS.ROUTES.DASHBOARD;
      case UserRole.MODERATOR:
        return APP_CONSTANTS.ROUTES.DASHBOARD;
      default:
        return APP_CONSTANTS.ROUTES.DASHBOARD;
    }
  }

  // Method to check if user has admin role
  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.userType === UserRole.ADMIN;
  }

  // Method to check if user has moderator role
  isModerator(): boolean {
    const user = this.currentUserValue;
    return user?.roleId === UserRole.MODERATOR;
  }

  private handleLoginError(error: HttpErrorResponse): void {
    let errorMessage = 'Login failed. Please try again.';

    if (error.status === 403) {
      errorMessage =
        'Access denied. Invalid credentials or insufficient permissions.';
      this.toastr.error(errorMessage, 'Forbidden');
    } else if (error.status === 401) {
      errorMessage =
        'Invalid credentials. Please check your civil number and password.';
      this.toastr.error(errorMessage, 'Unauthorized');
    } else if (error.status === 404) {
      errorMessage = 'Login service not found.';
      this.toastr.error(errorMessage, 'Not Found');
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
      this.toastr.error(errorMessage, 'Server Error');
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
      this.toastr.error(errorMessage, 'Login Error');
    } else {
      this.toastr.error(errorMessage, 'Login Error');
    }
  }
}
