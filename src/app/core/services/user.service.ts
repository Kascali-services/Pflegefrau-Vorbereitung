import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.model';
import { MOCK_USERS } from './mock-data';

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
    // Use the first mock user
    if (MOCK_USERS.length > 0) {
      this.currentUserSubject.next(MOCK_USERS[0]);
    }
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
