# Navigation Restructure Documentation

## Overview
This document describes the restructuring of the navigation menu to support hierarchical navigation with a parent "Verwaltung" (Management) section.

## Changes Made

### 1. Route Structure Changes

#### Old Routes
- `/dashboard` - Content management dashboard (for content_manager and admin)
- `/dashboard/user-management` - User management (admin only)
- `/dashboard/course/create` - Create new course
- `/dashboard/course/:courseId/lesson/create` - Create new lesson
- `/dashboard/lesson/:id` - Edit lesson

#### New Routes
- `/verwaltung/inhaltverwaltung` - Content management (renamed from "Dashboard")
- `/verwaltung/benutzerverwaltung` - User management (moved)
- `/verwaltung/dashboard` - **NEW** Admin dashboard showing all users
- `/verwaltung/inhaltverwaltung/course/create` - Create new course
- `/verwaltung/inhaltverwaltung/course/:courseId/lesson/create` - Create new lesson
- `/verwaltung/inhaltverwaltung/lesson/:id` - Edit lesson

#### Backward Compatibility
All old routes redirect to new routes for backward compatibility:
- `/dashboard` → `/verwaltung/inhaltverwaltung`
- `/dashboard/user-management` → `/verwaltung/benutzerverwaltung`
- `/dashboard/course/create` → `/verwaltung/inhaltverwaltung/course/create`
- etc.

### 2. Navigation Menu Structure

#### Desktop Navigation (with Material Menu dropdown)
```
Startseite
Kurse
Meine Kurse (requires auth)
Verwaltung (requires content_manager or admin) ▼
  ├── Inhaltverwaltung (requires content_manager or admin)
  ├── Benutzerverwaltung (requires admin)
  └── Dashboard (requires admin)
Über uns
Kontakt
```

#### Mobile Navigation (with Material Expansion Panel)
```
Startseite
Kurse
Meine Kurse (requires auth)
▶ Verwaltung (requires content_manager or admin)
    ├── Inhaltverwaltung (requires content_manager or admin)
    ├── Benutzerverwaltung (requires admin)
    └── Dashboard (requires admin)
Über uns
Kontakt
```

### 3. New Admin Dashboard Component

**Location:** `src/app/features/admin-dashboard/`

**Purpose:** Displays all users in a table format for admin overview

**Features:**
- Fetches all users from `/api/users/all` endpoint
- Displays user information in a Material table:
  - Email
  - First Name
  - Last Name
  - Role (with colored chips)
  - Registration Date
- Loading state with spinner
- Error handling

**Access:** Admin only (protected by `adminGuard`)

### 4. Updated Components

The following components were updated to use the new route structure:

- `DashboardComponent` - Content management dashboard
- `CourseCreatorComponent` - Course creation
- `LessonCreatorComponent` - Lesson creation
- `LessonEditorComponent` - Lesson editing

All navigation links in these components now point to the new `/verwaltung/inhaltverwaltung/*` routes.

### 5. Service Updates

**UserService** - Added new method:
```typescript
getAllUsers(): Observable<User[]>
```
This method calls the `GET /api/users/all` endpoint to fetch all registered users (admin only).

## User Role Access Matrix

| Route | Student | Content Manager | Admin |
|-------|---------|----------------|-------|
| `/verwaltung/inhaltverwaltung` | ❌ | ✅ | ✅ |
| `/verwaltung/benutzerverwaltung` | ❌ | ❌ | ✅ |
| `/verwaltung/dashboard` | ❌ | ❌ | ✅ |

## Implementation Details

### Navigation Component TypeScript Interface
```typescript
interface NavLink {
  path?: string;
  label: string;
  exact?: boolean;
  requiresAuth: boolean;
  requiresRole: boolean;
  requiresAdmin: boolean;
  children?: NavLink[];
}
```

### Material Components Used
- **Desktop:** `MatMenuModule` for dropdown menus
- **Mobile:** `MatExpansionModule` for collapsible sections
- **Admin Dashboard:** `MatTableModule`, `MatChipsModule` for data display

## Testing

To test the navigation changes:

1. **As Unauthenticated User:**
   - Only see: Startseite, Kurse, Über uns, Kontakt

2. **As Student:**
   - Additional: Meine Kurse
   - No access to Verwaltung menu

3. **As Content Manager:**
   - Additional: Verwaltung menu with "Inhaltverwaltung" visible
   - Can create and edit courses and lessons

4. **As Admin:**
   - Full access to all Verwaltung sub-items:
     - Inhaltverwaltung (manage courses/lessons)
     - Benutzerverwaltung (create users)
     - Dashboard (view all users)

## API Requirements

The new admin dashboard requires the backend to implement:

**Endpoint:** `GET /api/users/all`

**Response Format:**
```json
{
  "users": [
    {
      "id": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "student|content_manager|admin|team_member",
      "empfehlungsnummer": "string",
      "avatarUrl": "string",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string",
      "lastLoginAt": "ISO 8601 date string"
    }
  ]
}
```

**Authentication:** Requires valid JWT token with admin role
**Authorization:** Admin only

## Files Modified

### Components
- `src/app/core/layout/navigation/navigation.component.ts`
- `src/app/core/layout/navigation/navigation.component.html`
- `src/app/core/layout/mobile-menu/mobile-menu.component.ts`
- `src/app/core/layout/mobile-menu/mobile-menu.component.html`
- `src/app/core/layout/mobile-menu/mobile-menu.component.scss`
- `src/app/features/dashboard/dashboard.component.ts`
- `src/app/features/dashboard/course-creator/course-creator.component.ts`
- `src/app/features/dashboard/lesson-creator/lesson-creator.component.ts`
- `src/app/features/dashboard/lesson-editor/lesson-editor.component.ts`

### New Files
- `src/app/features/admin-dashboard/admin-dashboard.component.ts`
- `src/app/features/admin-dashboard/admin-dashboard.component.html`
- `src/app/features/admin-dashboard/admin-dashboard.component.scss`

### Services
- `src/app/core/services/user.service.ts`

### Routing
- `src/app/app.routes.ts`

## Future Enhancements

Potential improvements for the navigation:
1. Add breadcrumb navigation for better orientation in nested routes
2. Add user actions (edit, delete, role change) in the admin dashboard
3. Add search and filtering capabilities in the user table
4. Add pagination for large user lists
5. Add export functionality for user data
