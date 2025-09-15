# Routing Guide

## Overview

The application now uses Angular 19's standalone components with lazy loading for optimal performance.

## Route Structure

### Public Routes (No Authentication Required)

- **`/`** → Redirects to `/auth/login`
- **`/auth/login`** → Login page (standalone, no header/footer)

### Protected Routes (Authentication Required)

- **`/dashboard`** → Main dashboard with statistics and user info
- **`/profile`** → User profile management
- **`/settings`** → Application settings

### Fallback Routes

- **`/**`** → Redirects to `/auth/login` (404 handling)

## Route Configuration

### Lazy Loading

All feature components are lazy-loaded for better performance:

```typescript
{
  path: 'auth/login',
  loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent)
}
```

### Authentication Guards

Protected routes use `AuthGuard` to ensure user authentication:

```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
  canActivate: [AuthGuard]
}
```

## Layout Behavior

### Login Page

- **No Header/Footer**: Clean, standalone design
- **Full Screen**: Gradient background with centered form
- **Conditional Rendering**: Uses `isAuthRoute()` method to hide navigation

### Authenticated Pages

- **Header**: Navigation menu with user info and logout
- **Footer**: Application footer with links and branding
- **Main Content**: Router outlet displays feature components

## Navigation Flow

1. **Initial Load**: User visits `/` → Redirected to `/auth/login`
2. **Login Success**: User authenticated → Redirected to `/dashboard`
3. **Protected Access**: Unauthenticated users → Redirected to `/auth/login`
4. **Logout**: User logged out → Redirected to `/auth/login`

## Component Structure

### Standalone Components

- `LoginComponent` - Authentication form
- `DashboardComponent` - Main dashboard
- `ProfileComponent` - User profile
- `SettingsComponent` - Application settings
- `HeaderComponent` - Navigation header
- `FooterComponent` - Application footer

### Guards

- `AuthGuard` - Protects routes requiring authentication

### Interceptors

- `authInterceptor` - Automatically adds authentication tokens to HTTP requests

## Performance Benefits

1. **Lazy Loading**: Components load only when needed
2. **Standalone Components**: No NgModule overhead
3. **Tree Shaking**: Unused code is eliminated
4. **Bundle Splitting**: Smaller initial bundle size

## Development Notes

- All routes are configured in `src/app/app-routing.module.ts`
- Route constants are defined in `src/app/core/constants/app.constants.ts`
- Authentication logic is handled by `src/app/core/services/auth.service.ts`
- Route protection is managed by `src/app/core/guards/auth.guard.ts`
