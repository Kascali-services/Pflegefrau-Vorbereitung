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
   * Update user information (for future use)
   */
  updateUser(user: User): Observable<User> {
    // This would typically update the user in the backend
    // For now, we just return the user as is
    return of(user);
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout().subscribe();
  }
}
