import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { User } from '../../../core/models/user.model';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { TranslationService } from '../../../../locale/translation.service';
import { TranslatePipe } from '../../../../locale/translation.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmModalComponent, TranslatePipe],
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isCollapsed = false;
  showLogoutConfirm = false;
  appName = APP_CONSTANTS.APP_NAME;
  private sidebarSubscription?: Subscription;
  isRTL = false;

  @Output() mobileMenuClose = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Subscribe to sidebar state changes
    this.sidebarSubscription = this.sidebarService.isCollapsed$.subscribe(
      (collapsed) => {
        this.isCollapsed = collapsed;
      }
    );

    // Subscribe to language changes for RTL support
    this.translationService.getCurrentLanguage$().subscribe(() => {
      this.isRTL = this.translationService.isRTL();
    });
  }

  ngOnDestroy(): void {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getDashboardRoute(): string {
    return this.authService.getDashboardRoute();
  }

  onNavigationClick(): void {
    // Close mobile menu when navigation item is clicked
    this.mobileMenuClose.emit();
  }

  logout(): void {
    this.showLogoutConfirm = true;
  }

  onLogoutConfirm(): void {
    this.showLogoutConfirm = false;
    this.authService.logout();
    this.router.navigate([APP_CONSTANTS.ROUTES.LOGIN]);
  }

  onLogoutCancel(): void {
    this.showLogoutConfirm = false;
  }
}
