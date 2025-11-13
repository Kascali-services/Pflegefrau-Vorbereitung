# User Service Integration - Documentation

## Overview

The Angular frontend user service is now fully integrated with the backend user-service via the API gateway. This integration enables real-time profile management, avatar uploads, and user data synchronization with the backend.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           Angular Frontend                           │
│  ┌───────────────────────────────────────────────┐  │
│  │  SettingsComponent                            │  │
│  │  - Profile editing form                       │  │
│  │  - Avatar upload UI                           │  │
│  └───────────┬───────────────────────────────────┘  │
│              │ calls                                │
│  ┌───────────▼───────────────────────────────────┐  │
│  │  UserService (user.service.ts)                │  │
│  │  - updateProfile()                            │  │
│  │  - uploadAvatar()                             │  │
│  │  - getCurrentUser()                           │  │
│  └───────────┬───────────────────────────────────┘  │
│              │ HTTP calls with JWT                  │
└──────────────┼──────────────────────────────────────┘
               │
               │ http://localhost:8000/api/users/*
               ▼
┌──────────────────────────────────────────────────────┐
│           API Gateway (Port 8000)                    │
│  - Routes /api/users/* → user-service:8002          │
│  - JWT Authentication                               │
│  - Rate Limiting & Caching                          │
└───────────┬──────────────────────────────────────────┘
            │
            │ http://user-service:8002/api/users/*
            ▼
┌──────────────────────────────────────────────────────┐
│        User Service (Port 8002)                      │
│  - Profile management                                │
│  - Avatar uploads                                    │
│  - User data storage (PostgreSQL)                   │
└──────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. API Interfaces

**File**: `src/app/core/interfaces/user-api.interface.ts`

Defines TypeScript interfaces matching the backend API specification:

- `UserResponse` - Full user profile from GET /api/users/me
- `UpdateProfileRequest` - Request body for PUT /api/users/me
- `AvatarUploadResponse` - Response from POST /api/users/me/avatar
- `UserListResponse` - Limited user data (for admin endpoints)
- `UsersListResponse` - Paginated list of users

### 2. UserService Updates

**File**: `src/app/core/services/user.service.ts`

#### Key Changes:

- **HTTP Integration**: Replaced mock localStorage implementation with real HTTP calls
- **Gateway Communication**: All requests go through `${environment.apiUrl}/api/users`
- **File Upload**: Implemented FormData-based file uploads for avatars
- **Error Handling**: Comprehensive German error messages for all error scenarios
- **State Synchronization**: Updates AuthService state when profile is modified

#### Endpoints Implemented:

##### GET /api/users/me
- **Purpose**: Get current user profile
- **Authentication**: Required (JWT token)
- **Response**: Full user profile
- **Usage**: Called via AuthService's currentUser$ observable

##### PUT /api/users/me
- **Purpose**: Update user profile
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```typescript
  {
    firstName?: string;  // Optional, min 2 characters
    lastName?: string;   // Optional, min 2 characters
    avatarUrl?: string;  // Optional
  }
  ```
- **Response**: Updated user profile
- **Error Codes**:
  - 400: Invalid input (e.g., name too short)
  - 401: Not authenticated
  - 500: Server error

##### POST /api/users/me/avatar
- **Purpose**: Upload user avatar image
- **Authentication**: Required (JWT token)
- **Request**: FormData with file
- **File Constraints**:
  - Allowed types: JPEG, PNG, GIF, WebP
  - Max size: 5MB
- **Response**:
  ```typescript
  {
    avatarUrl: string;      // URL to access the uploaded avatar
    filename: string;       // Generated unique filename
    size: number;          // File size in bytes
    uploadedAt: string;    // Upload timestamp
  }
  ```
- **Error Codes**:
  - 400: Invalid file type
  - 413: File too large
  - 401: Not authenticated
  - 500: Server error

### 3. Error Handling

The service provides user-friendly German error messages:

| HTTP Status | Error Message |
|------------|---------------|
| 400 | Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben. |
| 401 | Nicht autorisiert. Bitte melden Sie sich erneut an. |
| 404 | Benutzer nicht gefunden |
| 413 | Datei ist zu groß. Maximale Größe: 5MB |
| 500 | Serverfehler. Bitte versuchen Sie es später erneut. |

When the server provides a specific error detail, it's displayed to the user.

### 4. State Management

The UserService maintains consistency with AuthService:

1. Profile updates trigger `authService.updateCurrentUser()`
2. Avatar uploads update the current user's avatarUrl in AuthService
3. Both services use the same user observable (`currentUser$`)
4. Changes are persisted to localStorage via AuthService

### 5. Testing

**File**: `src/app/core/services/user.service.spec.ts`

Test suite uses `HttpClientTestingModule` to mock HTTP requests:

- ✅ Get current user
- ✅ Get user by ID (returns error for non-matching IDs)
- ✅ Update profile via API
- ✅ Handle update errors (400 Bad Request)
- ✅ Upload avatar via API
- ✅ Handle avatar upload errors (413 Too Large, 400 Invalid Type)

All 9 tests passing ✓

## Usage Examples

### Updating User Profile

```typescript
import { UserService } from './core/services/user.service';

export class SettingsComponent {
  constructor(private userService: UserService) {}

  updateProfile(firstName: string, lastName: string) {
    const currentUser = this.authService.getCurrentUser();
    
    const updatedUser = {
      ...currentUser,
      firstName,
      lastName
    };

    this.userService.updateProfile(updatedUser).subscribe({
      next: (user) => {
        console.log('Profile updated:', user);
      },
      error: (error) => {
        console.error('Update failed:', error.message);
      }
    });
  }
}
```

### Uploading Avatar

```typescript
uploadAvatar(file: File) {
  this.userService.uploadAvatar(file).subscribe({
    next: (avatarUrl) => {
      console.log('Avatar uploaded:', avatarUrl);
      // Avatar URL is automatically updated in current user
    },
    error: (error) => {
      console.error('Upload failed:', error.message);
    }
  });
}
```

## Environment Configuration

### Development
**File**: `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000' // Gateway URL
};
```

### Production
**File**: `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: '' // Configure for production deployment
};
```

## Integration Testing

### Prerequisites
1. Start backend services:
   ```bash
   docker-compose up gateway user-service auth-service postgres redis
   ```

2. Start frontend dev server:
   ```bash
   npm start
   ```

### Test Scenarios

1. **Profile Update**
   - Navigate to Settings page (`/settings`)
   - Update first name and last name
   - Click "Speichern"
   - Verify success message appears
   - Verify user data is updated in header/navigation

2. **Avatar Upload**
   - Navigate to Settings page
   - Click avatar upload button
   - Select an image file (< 5MB)
   - Verify preview appears
   - Click "Speichern"
   - Verify avatar is uploaded and displayed

3. **Error Handling**
   - Try uploading a file > 5MB → Should show error
   - Try uploading a non-image file → Should show error
   - Try updating with empty name → Should show validation error

## Security Considerations

### 1. File Upload Security
- **Type Validation**: Backend validates allowed file types (JPEG, PNG, GIF, WebP)
- **Size Limits**: 5MB maximum enforced on both frontend and backend
- **Filename Sanitization**: Backend generates unique filenames to prevent conflicts
- **Storage**: Files stored in `/app/uploads/avatars` volume (not in database)

### 2. Authentication
- **JWT Required**: All endpoints require valid JWT token
- **Token Injection**: Automatically added via auth interceptor
- **Token Refresh**: Should be implemented for production

### 3. Input Validation
- **Frontend**: Basic validation (min length, required fields)
- **Backend**: Comprehensive validation with detailed error messages
- **XSS Protection**: Angular sanitizes all user input

## API Contract Compliance

### PUT /api/users/me
✅ Request: `{ firstName?, lastName?, avatarUrl? }`  
✅ Response: `UserResponse` object  
✅ Status: 200 on success, 400/401/500 on error

### POST /api/users/me/avatar
✅ Request: FormData with file  
✅ Response: `{ avatarUrl, filename, size, uploadedAt }`  
✅ Status: 200 on success, 400/401/413/500 on error

## Migration Notes

### What Changed
- **Before**: Mock implementation using localStorage and FileReader
- **After**: Real HTTP calls to backend via gateway

### What Stayed the Same
- Public API of UserService (same method signatures)
- Component integration (SettingsComponent works without changes)
- User model structure
- Observable patterns

### Backward Compatibility
✅ All existing components using UserService work without modification

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Ensure user is logged in
   - Check JWT token in localStorage
   - Verify auth interceptor is configured

2. **CORS Errors**
   - Verify gateway CORS configuration
   - Check frontend is accessing gateway URL (not service directly)

3. **File Upload Fails**
   - Check file size (< 5MB)
   - Verify file type is allowed
   - Check network tab for actual error

4. **Profile Not Updating**
   - Check browser console for errors
   - Verify backend services are running
   - Check database connection

## Production Checklist

- [x] HTTP client configured
- [x] API interfaces defined
- [x] User service implemented
- [x] File upload implemented
- [x] Error handling implemented
- [x] Tests updated and passing
- [x] Documentation created
- [ ] Production API URL configured
- [ ] File storage solution (S3/CDN) configured
- [ ] Image optimization/resizing implemented
- [ ] Token refresh mechanism
- [ ] Rate limiting tested

## Next Steps

1. Configure production API URL in `environment.prod.ts`
2. Set up cloud storage for avatar uploads (S3, Azure Blob, etc.)
3. Implement image resizing/optimization on upload
4. Add user avatar caching strategy
5. Implement admin endpoints (GET /api/users/:id, GET /api/users/)
6. Add avatar deletion functionality
7. Implement profile picture cropping UI

## Conclusion

The user service integration is complete and production-ready for development and testing. The implementation follows the same patterns as the auth service, maintains backward compatibility, and includes comprehensive testing and documentation.
