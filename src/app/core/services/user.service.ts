import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { TeamMember } from '../../models/team.model';
import { AuthService } from './auth.service';
import {
  UserResponse,
  UpdateProfileRequest,
  AvatarUploadResponse,
  TeamMemberResponse,
  TeamMembersListResponse,
} from '../interfaces/user-api.interface';
import { environment } from '../../../environments/environment';

/**
 * UserService - Manages user profile data via backend user-service
 * Communicates with user-service endpoints through the API gateway
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/api/users`;

  /**
   * Get current user
   */
  getCurrentUser(): Observable<User | null> {
    return this.authService.currentUser$;
  }

  /**
   * Get user by ID (for future API integration)
   */
  getUserById(userId: string): Observable<User | null> {
    // This endpoint requires admin privileges
    // For now, return current user if IDs match
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id === userId) {
      return this.authService.currentUser$;
    }
    
    // In the future, this would call GET /api/users/:id (admin only)
    return throwError(() => ({ message: 'Zugriff verweigert' }));
  }

  /**
   * Get all users (admin only)
   * Calls GET /api/users/all endpoint
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<{ users: UserResponse[] }>(`${this.apiUrl}/all`).pipe(
      map(response => response.users.map(userResponse => this.convertUserResponseToUser(userResponse))),
      catchError(this.handleError)
    );
  }

  /**
   * Convert UserResponse to User model
   */
  private convertUserResponseToUser(userResponse: UserResponse): User {
    return {
      id: userResponse.id,
      email: userResponse.email,
      firstName: userResponse.firstName,
      lastName: userResponse.lastName,
      avatarUrl: userResponse.avatarUrl,
      role: userResponse.role as 'student' | 'content_manager' | 'admin' | 'team_member',
      aktenzeichen: userResponse.empfehlungsnummer,
      createdAt: userResponse.createdAt ? new Date(userResponse.createdAt) : undefined,
      updatedAt: userResponse.updatedAt ? new Date(userResponse.updatedAt) : undefined,
      lastLoginAt: userResponse.lastLoginAt ? new Date(userResponse.lastLoginAt) : undefined,
    };
  }

  /**
   * Convert TeamMemberResponse to TeamMember model
   */
  private convertTeamMemberResponseToTeamMember(
    teamMemberResponse: TeamMemberResponse
  ): TeamMember {
    return {
      id: teamMemberResponse.id,
      email: teamMemberResponse.email,
      firstName: teamMemberResponse.firstName,
      lastName: teamMemberResponse.lastName,
      role: teamMemberResponse.role,
      bio: teamMemberResponse.bio,
      specialties: teamMemberResponse.specialties,
      avatarUrl: teamMemberResponse.avatarUrl,
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
        errorMessage = 'Nicht autorisiert. Bitte melden Sie sich erneut an.';
      } else if (error.status === 400) {
        errorMessage =
          error.error?.detail || 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben.';
      } else if (error.status === 404) {
        errorMessage = 'Benutzer nicht gefunden';
      } else if (error.status === 413) {
        errorMessage = 'Datei ist zu groß. Maximale Größe: 5MB';
      } else if (error.status === 500) {
        errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
      } else if (error.error?.detail) {
        errorMessage = error.error.detail;
      }
    }

    return throwError(() => ({ message: errorMessage }));
  }

  /**
   * Update user profile information
   * Calls PUT /api/users/me endpoint in the backend
   *
   * @param user - Updated user data
   * @returns Observable with updated user data
   */
  updateProfile(user: User): Observable<User> {
    const updateRequest: UpdateProfileRequest = {
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      specialties: user.specialties,
    };

    return this.http.put<UserResponse>(`${this.apiUrl}/me`, updateRequest).pipe(
      map(response => {
        // Convert to User model
        const updatedUser = this.convertUserResponseToUser(response);

        // Update in AuthService to keep state synchronized
        this.authService.updateCurrentUser(updatedUser);

        return updatedUser;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Upload user avatar/profile photo
   * Calls POST /api/users/me/avatar endpoint in the backend
   *
   * @param file - Image file to upload
   * @returns Observable with the uploaded avatar URL
   */
  uploadAvatar(file: File): Observable<string> {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<AvatarUploadResponse>(`${this.apiUrl}/me/avatar`, formData).pipe(
      tap(response => {
        // Update current user's avatar URL
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            avatarUrl: response.avatarUrl,
          };
          this.authService.updateCurrentUser(updatedUser);
        }
      }),
      map(response => response.avatarUrl),
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout().subscribe();
  }

  /**
   * Get all team members (public access)
   * Calls GET /api/users/team-members endpoint
   */
  getAllTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMembersListResponse>(`${this.apiUrl}/team-members`).pipe(
      map(response => response.teamMembers.map(tm => this.convertTeamMemberResponseToTeamMember(tm))),
      catchError(this.handleError)
    );
  }

  /**
   * Get a team member by ID (public access)
   * Calls GET /api/users/team-members/:id endpoint
   *
   * @param id - Team member ID
   */
  getTeamMemberById(id: string): Observable<TeamMember> {
    return this.http.get<TeamMemberResponse>(`${this.apiUrl}/team-members/${id}`).pipe(
      map(response => this.convertTeamMemberResponseToTeamMember(response)),
      catchError(this.handleError)
    );
  }
}
