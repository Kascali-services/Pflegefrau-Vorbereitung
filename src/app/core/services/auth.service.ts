import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models/user.model';

/**
 * AuthService - Simulates authentication with backend
 * Manages login, logout, and registration
 * Will be replaced with actual backend integration later (AuthLib)
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  // Mock users database for simulation
  private mockUsers: User[] = [
    {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'password123', // In real app, this would be hashed
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  constructor() {
    // Check if user is already logged in (from localStorage)
    this.checkAuthState();
  }

  /**
   * Check authentication state from localStorage
   */
  private checkAuthState(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }

  /**
   * Simulate login - authenticate user with email and password
   * @param email User email
   * @param password User password
   * @returns Observable with user data or error
   */
  login(email: string, password: string): Observable<User> {
    // Simulate API delay
    return new Observable(observer => {
      setTimeout(() => {
        // Find user in mock database
        const user = this.mockUsers.find(
          u => u.email === email && u.passwordHash === password
        );

        if (user) {
          // Create user object without password
          const authenticatedUser: User = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: new Date(),
          };

          // Update state
          this.currentUserSubject.next(authenticatedUser);
          this.isAuthenticatedSubject.next(true);

          // Store in localStorage
          localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));

          observer.next(authenticatedUser);
          observer.complete();
        } else {
          observer.error({ message: 'Email ou mot de passe incorrect' });
        }
      }, 500); // Simulate 500ms network delay
    });
  }

  /**
   * Simulate logout - clear authentication state
   */
  logout(): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        localStorage.removeItem('currentUser');

        observer.next();
        observer.complete();
      }, 300); // Simulate 300ms network delay
    });
  }

  /**
   * Simulate user registration
   * @param email User email
   * @param password User password
   * @param firstName User first name
   * @param lastName User last name
   * @returns Observable with created user data or error
   */
  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Observable<User> {
    return new Observable(observer => {
      setTimeout(() => {
        // Check if user already exists
        const existingUser = this.mockUsers.find(u => u.email === email);

        if (existingUser) {
          observer.error({ message: 'Cet email est déjà utilisé' });
          return;
        }

        // Create new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          firstName,
          lastName,
          passwordHash: password,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add to mock database
        this.mockUsers.push(newUser);

        // Create user object without password for response
        const registeredUser: User = {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        };

        // Auto-login after registration
        this.currentUserSubject.next(registeredUser);
        this.isAuthenticatedSubject.next(true);
        localStorage.setItem('currentUser', JSON.stringify(registeredUser));

        observer.next(registeredUser);
        observer.complete();
      }, 800); // Simulate 800ms network delay
    });
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
}
