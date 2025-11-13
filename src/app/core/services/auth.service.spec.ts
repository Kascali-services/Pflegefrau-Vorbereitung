import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { User } from '../../models/user.model';
import { AuthResponse } from '../interfaces/auth-api.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8000/api/auth';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with unauthenticated state', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should login successfully with valid credentials', done => {
    const mockResponse: AuthResponse = {
      user: {
        id: 'user-001',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
      },
      token: 'mock-jwt-token',
    };

    service.login('test@example.com', 'password123').subscribe({
      next: (user: User) => {
        expect(user).toBeTruthy();
        expect(user.email).toBe('test@example.com');
        expect(service.isAuthenticated()).toBe(true);
        expect(service.getCurrentUser()).toBeTruthy();
        expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
        done();
      },
      error: () => {
        fail('Login should succeed with valid credentials');
        done();
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      password: 'password123',
    });
    req.flush(mockResponse);
  });

  it('should fail login with invalid credentials', done => {
    service.login('wrong@example.com', 'wrongpassword').subscribe({
      next: () => {
        fail('Login should fail with invalid credentials');
        done();
      },
      error: error => {
        expect(error.message).toBeTruthy();
        expect(service.isAuthenticated()).toBe(false);
        done();
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush({ detail: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should logout successfully', done => {
    // Setup authenticated state
    localStorage.setItem('authToken', 'mock-token');
    const mockUser: User = {
      id: 'user-001',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    service['currentUserSubject'].next(mockUser);
    service['isAuthenticatedSubject'].next(true);

    service.logout().subscribe(() => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Déconnexion réussie' });
  });

  it('should register new user successfully', done => {
    const mockResponse: AuthResponse = {
      user: {
        id: 'user-002',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'student',
      },
      token: 'mock-jwt-token',
    };

    service.register('new@example.com', 'newpassword', 'New', 'User').subscribe({
      next: (user: User) => {
        expect(user).toBeTruthy();
        expect(user.email).toBe('new@example.com');
        expect(user.firstName).toBe('New');
        expect(user.lastName).toBe('User');
        expect(service.isAuthenticated()).toBe(true);
        expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
        done();
      },
      error: () => {
        fail('Registration should succeed with new email');
        done();
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'new@example.com',
      password: 'newpassword',
      firstName: 'New',
      lastName: 'User',
      empfehlungsnummer: undefined,
    });
    req.flush(mockResponse);
  });

  it('should fail registration with existing email', done => {
    service.register('test@example.com', 'password', 'Test', 'User').subscribe({
      next: () => {
        fail('Registration should fail with existing email');
        done();
      },
      error: error => {
        expect(error.message).toContain('bereits verwendet');
        done();
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/register`);
    req.flush(
      { detail: 'Email already exists' },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('should persist authentication in localStorage', done => {
    const mockResponse: AuthResponse = {
      user: {
        id: 'user-001',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
      },
      token: 'mock-jwt-token',
    };

    service.login('test@example.com', 'password123').subscribe(() => {
      const storedUser = localStorage.getItem('currentUser');
      expect(storedUser).toBeTruthy();

      const user = JSON.parse(storedUser!);
      expect(user.email).toBe('test@example.com');
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush(mockResponse);
  });

  it('should restore authentication from localStorage', () => {
    const mockUser: User = {
      id: 'test-id',
      email: 'stored@example.com',
      firstName: 'Stored',
      lastName: 'User',
    };

    // Clear existing service and reset TestBed to create a fresh instance
    TestBed.resetTestingModule();
    
    // Set up localStorage before creating service
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'stored-token');

    // Configure TestBed again with providers
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    // Create new service instance to trigger checkAuthState
    const newService = TestBed.inject(AuthService);
    const newHttpMock = TestBed.inject(HttpTestingController);

    expect(newService.isAuthenticated()).toBe(true);
    expect(newService.getCurrentUser()?.email).toBe('stored@example.com');
    
    // Verify no HTTP requests were made (service restored from localStorage)
    newHttpMock.verify();
  });

  it('should clear localStorage on logout', done => {
    // Setup authenticated state
    localStorage.setItem('authToken', 'mock-token');
    const mockUser: User = {
      id: 'user-001',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    service.logout().subscribe(() => {
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('authToken');
      expect(storedUser).toBeNull();
      expect(storedToken).toBeNull();
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/logout`);
    req.flush({ message: 'Déconnexion réussie' });
  });
});
