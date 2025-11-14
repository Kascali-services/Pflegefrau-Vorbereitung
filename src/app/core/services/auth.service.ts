import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from '../../models/user.model';
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  RegisterTeamMemberRequest,
  ResetPasswordRequest,
  LogoutResponse,
  ResetPasswordResponse,
} from '../interfaces/auth-api.interface';
import { environment } from '../../../environments/environment';

/**
 * AuthService - Handles authentication with backend auth service via gateway
 * Manages login, logout, registration, and JWT token storage
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/auth`;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if user is already logged in (from localStorage)
    this.checkAuthState();
  }

  /**
   * Check authentication state from localStorage
   */
  private checkAuthState(): void {
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch {
        this.clearAuthData();
      }
    }
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  /**
   * Convert AuthUser to User model
   */
  private convertAuthUserToUser(authUser: AuthUser): User {
    return {
      id: authUser.id,
      email: authUser.email,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      role: authUser.role as 'student' | 'content_manager' | 'admin',
      aktenzeichen: authUser.empfehlungsnummer,
      createdAt: authUser.createdAt ? new Date(authUser.createdAt) : undefined,
      lastLoginAt: authUser.lastLoginAt
        ? new Date(authUser.lastLoginAt)
        : undefined,
    };
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ein unbekannter Fehler ist aufgetreten';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Fehler: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'E-Mail oder Passwort ungültig';
      } else if (error.status === 400) {
        errorMessage =
          error.error?.detail || 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben.';
      } else if (error.status === 500) {
        errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
      } else if (error.error?.detail) {
        errorMessage = error.error.detail;
      }
    }

    return throwError(() => ({ message: errorMessage }));
  }

  /**
   * Login - authenticate user with email and password
   * @param email User email
   * @param password User password
   * @returns Observable with user data or error
   */
  login(email: string, password: string): Observable<User> {
    const loginRequest: LoginRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap(response => {
        // Store token
        localStorage.setItem('authToken', response.token);
      }),
      map(response => {
        // Convert to User model
        const user = this.convertAuthUserToUser(response.user);

        // Update state
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);

        // Store user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));

        return user;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout - clear authentication state and invalidate token
   */
  logout(): Observable<void> {
    return this.http.post<LogoutResponse>(`${this.apiUrl}/logout`, {}).pipe(
      map(() => {
        // Clear state
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.clearAuthData();
      }),
      catchError(error => {
        // Even if API fails, clear local state
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  /**
   * Register - create a new user account
   * @param email User email
   * @param password User password
   * @param firstName User first name
   * @param lastName User last name
   * @param empfehlungsnummer Optional recommendation number (max 8 characters)
   * @returns Observable with created user data or error
   */
  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    empfehlungsnummer?: string
  ): Observable<User> {
    const registerRequest: RegisterRequest = {
      email,
      password,
      firstName,
      lastName,
      empfehlungsnummer,
    };

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, registerRequest)
      .pipe(
        tap(response => {
          // Store token
          localStorage.setItem('authToken', response.token);
        }),
        map(response => {
          // Convert to User model
          const user = this.convertAuthUserToUser(response.user);

          // Auto-login after registration
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          localStorage.setItem('currentUser', JSON.stringify(user));

          return user;
        }),
        catchError(error => {
          if (error.status === 400 && error.error?.detail) {
            // Handle specific validation errors
            if (error.error.detail.includes('already')) {
              return throwError(() => ({
                message: 'Diese E-Mail wird bereits verwendet',
              }));
            }
          }
          return this.handleError(error);
        })
      );
  }

  /**
   * Register team member - create a new team member account (admin/content_manager)
   * This method should only be called by admin users
   * @param email Team member email
   * @param password Team member password
   * @param firstName Team member first name
   * @param lastName Team member last name
   * @param role Team member role (admin or content_manager)
   * @param specialties Optional specialties array
   * @param bio Optional biography
   * @returns Observable with created user data or error
   */
  registerTeamMember(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'admin' | 'content_manager',
    specialties?: string[],
    bio?: string
  ): Observable<User> {
    const registerRequest: RegisterTeamMemberRequest = {
      email,
      password,
      firstName,
      lastName,
      role,
      specialties,
      bio,
    };

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register-team-member`, registerRequest)
      .pipe(
        map(response => {
          // Convert to User model (don't auto-login for team member registration)
          return this.convertAuthUserToUser(response.user);
        }),
        catchError(error => {
          if (error.status === 400 && error.error?.detail) {
            // Handle specific validation errors
            if (error.error.detail.includes('already')) {
              return throwError(() => ({
                message: 'Diese E-Mail wird bereits verwendet',
              }));
            }
          }
          return this.handleError(error);
        })
      );
  }

  /**
   * Reset password - initiate password reset process
   * @param email User email
   * @returns Observable with success or error
   */
  resetPassword(email: string): Observable<void> {
    const resetRequest: ResetPasswordRequest = { email };

    return this.http
      .post<ResetPasswordResponse>(`${this.apiUrl}/reset-password`, resetRequest)
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  /**
   * Get current authentication state
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Update current user data
   * Used by UserService to update user profile
   * @param user Updated user data
   */
  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}
