import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import { Router } from '@angular/router';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmModalComponent],
})
export class HeaderComponent {
  currentUser: User | null = null;
  appName = APP_CONSTANTS.APP_NAME;
  isDropdownOpen = false;
  showLogoutConfirm = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenuButton = document.getElementById('user-menu-button');

    if (userMenuButton && !userMenuButton.contains(target)) {
      this.closeDropdown();
    }
  }

  logout(): void {
    this.showLogoutConfirm = true;
    this.closeDropdown();
  }

  onLogoutConfirm(): void {
    this.showLogoutConfirm = false;
    this.authService.logout();
    this.router.navigate([APP_CONSTANTS.ROUTES.LOGIN]);
  }

  onLogoutCancel(): void {
    this.showLogoutConfirm = false;
  }

  // Check if current user is admin
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Get the appropriate dashboard route based on user role
  getDashboardRoute(): string {
    return this.authService.getDashboardRoute();
  }
}
