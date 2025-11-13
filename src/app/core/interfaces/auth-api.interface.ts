/**
 * Auth API Response Interfaces
 * Based on backend documentation for auth-service endpoints
 */

/**
 * User data returned from auth endpoints
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  empfehlungsnummer?: string;
  role: string;
  createdAt?: string;
  lastLoginAt?: string;
}

/**
 * Response from /api/auth/register and /api/auth/login
 */
export interface AuthResponse {
  user: AuthUser;
  token: string;
}

/**
 * Response from /api/auth/logout
 */
export interface LogoutResponse {
  message: string;
}

/**
 * Response from /api/auth/reset-password
 */
export interface ResetPasswordResponse {
  message: string;
}

/**
 * Response from /api/auth/reset-password/confirm
 */
export interface ResetPasswordConfirmResponse {
  message: string;
}

/**
 * Response from /api/auth/verify
 */
export interface VerifyTokenResponse {
  valid: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Request body for /api/auth/register
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  empfehlungsnummer?: string;
}

/**
 * Request body for /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Request body for /api/auth/reset-password
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Request body for /api/auth/reset-password/confirm
 */
export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}
