import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { User } from '../../models/user.model';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
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
    service.login('test@example.com', 'password123').subscribe({
      next: (user: User) => {
        expect(user).toBeTruthy();
        expect(user.email).toBe('test@example.com');
        expect(service.isAuthenticated()).toBe(true);
        expect(service.getCurrentUser()).toBeTruthy();
        done();
      },
      error: () => {
        fail('Login should succeed with valid credentials');
        done();
      },
    });
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
  });

  it('should logout successfully', done => {
    // First login
    service.login('test@example.com', 'password123').subscribe(() => {
      expect(service.isAuthenticated()).toBe(true);

      // Then logout
      service.logout().subscribe(() => {
        expect(service.isAuthenticated()).toBe(false);
        expect(service.getCurrentUser()).toBeNull();
        done();
      });
    });
  });

  it('should register new user successfully', done => {
    service.register('new@example.com', 'newpassword', 'New', 'User').subscribe({
      next: (user: User) => {
        expect(user).toBeTruthy();
        expect(user.email).toBe('new@example.com');
        expect(user.firstName).toBe('New');
        expect(user.lastName).toBe('User');
        expect(service.isAuthenticated()).toBe(true);
        done();
      },
      error: () => {
        fail('Registration should succeed with new email');
        done();
      },
    });
  });

  it('should fail registration with existing email', done => {
    // Register first user
    service.register('test@example.com', 'password', 'Test', 'User').subscribe(() => {
      service.logout().subscribe(() => {
        // Try to register with same email
        service.register('test@example.com', 'password', 'Test', 'User').subscribe({
          next: () => {
            fail('Registration should fail with existing email');
            done();
          },
          error: error => {
            expect(error.message).toContain('déjà utilisé');
            done();
          },
        });
      });
    });
  });

  it('should persist authentication in localStorage', done => {
    service.login('test@example.com', 'password123').subscribe(() => {
      const storedUser = localStorage.getItem('currentUser');
      expect(storedUser).toBeTruthy();

      const user = JSON.parse(storedUser!);
      expect(user.email).toBe('test@example.com');
      done();
    });
  });

  it('should restore authentication from localStorage', () => {
    const mockUser: User = {
      id: 'test-id',
      email: 'stored@example.com',
      firstName: 'Stored',
      lastName: 'User',
    };

    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    // Create new service instance to trigger checkAuthState
    const newService = TestBed.inject(AuthService);

    expect(newService.isAuthenticated()).toBe(true);
    expect(newService.getCurrentUser()?.email).toBe('stored@example.com');
  });

  it('should clear localStorage on logout', done => {
    service.login('test@example.com', 'password123').subscribe(() => {
      service.logout().subscribe(() => {
        const storedUser = localStorage.getItem('currentUser');
        expect(storedUser).toBeNull();
        done();
      });
    });
  });
});
