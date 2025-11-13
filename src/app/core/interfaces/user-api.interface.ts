/**
 * User API Response Interfaces
 * Based on backend documentation for user-service endpoints via gateway
 */

/**
 * User response from user-service endpoints
 * Returned from GET /api/users/me
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  empfehlungsnummer?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

/**
 * User list response (limited fields for privacy)
 * Returned from GET /api/users/:id
 */
export interface UserListResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

/**
 * Paginated users list response
 * Returned from GET /api/users/
 */
export interface UsersListResponse {
  users: UserListResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Request body for PUT /api/users/me
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

/**
 * Response from POST /api/users/me/avatar
 */
export interface AvatarUploadResponse {
  avatarUrl: string;
  filename: string;
  size: number;
  uploadedAt: string;
}
