# Login Page Changes

## Overview

The login page has been updated to be a standalone page without header and footer, and now uses civil number instead of email for authentication.

## Changes Made

### 1. User Model Updates

- Changed `email` to `civilNo` in the User interface
- Updated LoginRequest interface to use `civilNo` instead of `email`
- Made `email` optional in User interface

### 2. Login Component Updates

- Updated form validation to require civil number (12 digits)
- Changed input field from email to civil number
- Added proper validation messages
- Enhanced UI with better labels and error handling

### 3. Layout Changes

- Login page now displays without header and footer
- Added conditional rendering in app component based on route
- Login page has its own branding and footer

### 4. Routing Updates

- Default route now redirects to login instead of dashboard
- Auth guard redirects to login when not authenticated
- 404 routes redirect to login

## Features

### Login Form

- **Civil Number**: 12-digit validation
- **Password**: Minimum 6 characters
- **Real-time validation**: Shows errors as user types
- **Loading state**: Disabled button with spinner during login
- **Error handling**: Displays API errors in a styled container

### UI/UX

- Full-screen gradient background
- Centered login form
- Responsive design
- Custom color scheme using Tailwind CSS
- Professional branding

### Security

- Form validation on both client and server side
- Secure password field
- Token-based authentication
- Route protection with guards

## API Integration

- Endpoint: `https://tech.moo.gov.kw/courses/api/authentications/login`
- Request format: `{ civilNo: string, password: string }`
- Response includes user data and authentication tokens

## Usage

1. Navigate to `/auth/login` or root `/`
2. Enter 12-digit civil number
3. Enter password (minimum 6 characters)
4. Click "Sign in" button
5. Upon successful login, redirects to dashboard
