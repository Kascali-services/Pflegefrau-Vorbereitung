import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../../models/user.model';
import { AuthService } from './auth.service';

/**
 * UserService - Manages user data and authentication
 * Now uses AuthService as the single source of truth for user data
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private authService = inject(AuthService);

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
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id === userId) {
      return of(currentUser);
    }
    return of(null);
  }

  /**
   * Update user profile information
   * This will communicate with PUT /api/users/me endpoint in the backend
   *
   * @param user - Updated user data
   * @returns Observable with updated user data
   */
  updateProfile(user: User): Observable<User> {
    // For now, update the user in localStorage and AuthService
    // In production, this would call PUT /api/users/me endpoint
    const updatedUser: User = {
      ...user,
      updatedAt: new Date(),
    };

    // Update in localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Update in AuthService
    this.authService.updateCurrentUser(updatedUser);

    return of(updatedUser);
  }

  /**
   * Upload user avatar/profile photo
   * This will communicate with POST /api/media/upload endpoint in the backend
   *
   * @param file - Image file to upload
   * @returns Observable with the uploaded avatar URL
   */
  uploadAvatar(file: File): Observable<string> {
    // In production, this would upload to POST /api/media/upload
    // For now, simulate the upload by creating a local URL
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = e => {
        const avatarUrl = e.target?.result as string;
        observer.next(avatarUrl);
        observer.complete();
      };
      reader.onerror = () => {
        observer.error(new Error('Fehler beim Hochladen des Bildes'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout().subscribe();
  }
}
