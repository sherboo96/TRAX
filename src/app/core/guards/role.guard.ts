import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser) {
      this.router.navigate([APP_CONSTANTS.ROUTES.LOGIN]);
      return false;
    }

    // Check if route requires admin role
    if (state.url.startsWith('/admin')) {
      if (currentUser.userType !== UserRole.ADMIN) {
        // Redirect non-admin users to their appropriate dashboard
        this.router.navigate([APP_CONSTANTS.ROUTES.DASHBOARD]);
        return false;
      }
    }

    // Check if route requires moderator role (if needed in future)
    if (state.url.startsWith('/moderator')) {
      if (
        currentUser.userType !== UserRole.MODERATOR &&
        currentUser.userType !== UserRole.ADMIN
      ) {
        this.router.navigate([APP_CONSTANTS.ROUTES.DASHBOARD]);
        return false;
      }
    }

    return true;
  }
}
