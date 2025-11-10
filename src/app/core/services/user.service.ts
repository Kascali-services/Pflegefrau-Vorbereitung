import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.model';

/**
 * UserService - Manages user data and authentication
 * Currently uses mock data; can be extended to use HTTP API
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeMockUser();
  }

  /**
   * Get current user
   */
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  /**
   * Get user by ID (for future API integration)
   */
  getUserById(userId: string): Observable<User | null> {
    const currentUser = this.currentUserSubject.value;
    if (currentUser?.id === userId) {
      return of(currentUser);
    }
    return of(null);
  }

  /**
   * Initialize mock user data for development
   * In production, this would be replaced with actual authentication
   */
  private initializeMockUser(): void {
    const mockUser: User = {
      id: 'user-001',
      name: 'Marie Dupont',
      email: 'marie.dupont@example.com',
    };

    this.currentUserSubject.next(mockUser);
  }

  /**
   * Update user information (for future use)
   */
  updateUser(user: User): Observable<User> {
    this.currentUserSubject.next(user);
    return of(user);
  }

  /**
   * Logout user (for future use)
   */
  logout(): void {
    this.currentUserSubject.next(null);
  }
}
