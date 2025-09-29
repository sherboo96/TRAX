import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { APP_CONSTANTS } from '../constants/app.constants';
import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ModeratorGuard implements CanActivate {
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

    // Allow access for moderators (type 2 and 3) and admins
    if (
      currentUser.userType === UserRole.MODERATOR ||
      currentUser.userType === UserRole.MODERATOR_TYPE_3 ||
      currentUser.userType === UserRole.ADMIN
    ) {
      return true;
    }

    // Redirect non-moderator users to their appropriate dashboard
    this.router.navigate([APP_CONSTANTS.ROUTES.DASHBOARD]);
    return false;
  }
}
