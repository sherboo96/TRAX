import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { APP_CONSTANTS } from './core/constants/app.constants';
import { AuthRedirectGuard } from './core/guards/auth-redirect.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { IntroductionGuard } from './core/guards/introduction.guard';
import { ModeratorGuard } from './core/guards/moderator.guard';
import { RoleGuard } from './core/guards/role.guard';
import { AddCourseComponent } from './features/admin/components/add-course/add-course.component';
import { AdminCoursesComponent } from './features/admin/components/admin-courses/admin-courses.component';
import { AdminDashboardComponent } from './features/admin/components/admin-dashboard/admin-dashboard.component';
import { AdminDepartmentsComponent } from './features/admin/components/admin-departments/admin-departments.component';
import { AdminInstitutionsComponent } from './features/admin/components/admin-institutions/admin-institutions.component';
import { AdminInstructorsComponent } from './features/admin/components/admin-instructors/admin-instructors.component';
import { AdminLocationsComponent } from './features/admin/components/admin-locations/admin-locations.component';
import { AdminOrganizationsComponent } from './features/admin/components/admin-organizations/admin-organizations.component';
import { AdminRequestsComponent } from './features/admin/components/admin-requests/admin-requests.component';
import { AdminRolesComponent } from './features/admin/components/admin-roles/admin-roles.component';
import { AdminSuggestedCoursesComponent } from './features/admin/components/admin-suggested-courses/admin-suggested-courses.component';
import { AdminUsersComponent } from './features/admin/components/admin-users/admin-users.component';
import { IntroductionComponent } from './features/auth/components/introduction/introduction.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { CourseDetailsComponent } from './features/courses/components/course-details/course-details.component';
import { CourseScanComponent } from './features/courses/components/course-scan/course-scan.component';
import { CoursesComponent } from './features/courses/components/courses/courses.component';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { DigitalLibraryComponent } from './features/digital-library/components/digital-library/digital-library.component';
import { ResourceDetailsComponent } from './features/digital-library/components/resource-details/resource-details.component';
import { ProfileComponent } from './features/profile/components/profile/profile.component';
import { SettingsComponent } from './features/settings/components/settings/settings.component';

export const routes: Routes = [
  // Default route - redirect to introduction
  {
    path: '',
    redirectTo: APP_CONSTANTS.ROUTES.INTRODUCTION,
    pathMatch: 'full',
  },

  // Introduction route
  {
    path: 'introduction',
    component: IntroductionComponent,
    canActivate: [IntroductionGuard],
  },

  // Authentication routes
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [AuthRedirectGuard],
  },

  // Protected routes - require authentication (for regular users)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
  },

  // Course routes - require authentication
  {
    path: 'courses',
    component: CoursesComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'courses/:id',
    component: CourseDetailsComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'courses/:id/scan',
    component: CourseScanComponent,
    canActivate: [AuthGuard],
  },

  // Course Requests - visible to all authenticated users
  {
    path: 'requests',
    component: AdminRequestsComponent,
    canActivate: [AuthGuard],
  },

  // Digital Library routes - require authentication
  {
    path: 'admin/digital-library',
    component: DigitalLibraryComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'admin/digital-library/resource/:id',
    component: ResourceDetailsComponent,
    canActivate: [AuthGuard],
  },

  // Admin routes - require authentication AND admin role
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/courses',
    component: AdminCoursesComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/courses/add',
    component: AddCourseComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/courses/edit/:id',
    component: AddCourseComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/courses/:id',
    component: CourseDetailsComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'admin/instructors',
    component: AdminInstructorsComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/institutions',
    component: AdminInstitutionsComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/users',
    component: AdminUsersComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/departments',
    component: AdminDepartmentsComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/organizations',
    component: AdminOrganizationsComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/locations',
    component: AdminLocationsComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/roles',
    component: AdminRolesComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/suggested-courses',
    component: AdminSuggestedCoursesComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  {
    path: 'admin/requests',
    component: AdminRequestsComponent,
    canActivate: [AuthGuard, RoleGuard],
  },

  // Moderator routes - require authentication AND moderator role (userType 3)
  {
    path: 'moderator/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, ModeratorGuard],
  },

  {
    path: 'moderator/courses',
    component: AdminCoursesComponent,
    canActivate: [AuthGuard, ModeratorGuard],
  },

  {
    path: 'moderator/instructors',
    component: AdminInstructorsComponent,
    canActivate: [AuthGuard, ModeratorGuard],
  },

  {
    path: 'moderator/institutions',
    component: AdminInstitutionsComponent,
    canActivate: [AuthGuard, ModeratorGuard],
  },

  {
    path: 'moderator/locations',
    component: AdminLocationsComponent,
    canActivate: [AuthGuard, ModeratorGuard],
  },

  {
    path: 'moderator/courses/add',
    component: AddCourseComponent,
    canActivate: [AuthGuard, ModeratorGuard],
  },

  {
    path: 'moderator/courses/edit/:id',
    component: AddCourseComponent,
    canActivate: [AuthGuard, ModeratorGuard],
  },

  {
    path: 'moderator/courses/:id',
    component: CourseDetailsComponent,
    canActivate: [AuthGuard, ModeratorGuard],
  },

  // Catch all route - redirect to introduction
  {
    path: '**',
    redirectTo: APP_CONSTANTS.ROUTES.INTRODUCTION,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Enable hash location strategy for better compatibility
      useHash: false,
      // Enable scroll position restoration
      scrollPositionRestoration: 'enabled',
      // Enable anchor scrolling
      anchorScrolling: 'enabled',
      // Enable scroll offset
      scrollOffset: [0, 0],
      // Enable initial navigation
      initialNavigation: 'enabledBlocking',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
