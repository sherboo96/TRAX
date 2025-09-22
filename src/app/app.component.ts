import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import {
  RouterModule,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { SidebarService } from './shared/services/sidebar.service';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models/user.model';
import { APP_CONSTANTS } from './core/constants/app.constants';
import { TranslationService } from '../locale/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, SidebarComponent],
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = APP_CONSTANTS.APP_NAME;
  isLoading = false;
  currentUser: User | null = null;
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  showLogoutConfirm = false;
  isRTL = false;
  private routerSubscription?: Subscription;
  private sidebarSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sidebarService: SidebarService,
    private titleService: Title,
    private translationService: TranslationService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.setupRouteLoading();
    this.setupSidebarState();
    this.setAppTitle();
    this.setupRTLSupport();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }

  private setupRouteLoading(): void {
    this.routerSubscription = this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        )
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isLoading = true;
        } else {
          // Add a small delay to prevent flickering for fast navigation
          setTimeout(() => {
            this.isLoading = false;
          }, 100);
        }
      });
  }

  private setupSidebarState(): void {
    this.sidebarSubscription = this.sidebarService.isCollapsed$.subscribe(
      (collapsed) => {
        this.isSidebarCollapsed = collapsed;
      }
    );
  }

  private setAppTitle(): void {
    this.titleService.setTitle(this.title);
  }

  private setupRTLSupport(): void {
    this.translationService.getCurrentLanguage$().subscribe(() => {
      this.isRTL = this.translationService.isRTL();
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  isAuthRoute(): boolean {
    return (
      this.router.url.startsWith('/auth') ||
      this.router.url.startsWith('/introduction')
    );
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
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

  getFirstThreeNamesCapitalized(fullName: string): string {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .slice(0, 3)
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
      .join(' ');
  }
}
