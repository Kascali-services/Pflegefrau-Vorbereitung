import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { User } from '../../models/user.model';
import { AuthService } from './auth.service';

describe('UserService', () => {
  let service: UserService;
  let authService: AuthService;

  const mockUser: User = {
    id: 'user-001',
    email: 'marie.dupont@example.com',
    firstName: 'Marie',
    lastName: 'Dupont',
    role: 'student',
    passwordHash: 'password123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lastLoginAt: new Date('2025-02-10'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
    authService = TestBed.inject(AuthService);

    // Setup: login a user before each test
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    authService['checkAuthState']();
  });

  afterEach(() => {
    // Cleanup: clear localStorage after each test
    localStorage.removeItem('currentUser');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a current user', done => {
    service.getCurrentUser().subscribe(user => {
      expect(user).toBeTruthy();
      expect(user?.id).toBe('user-001');
      expect(user?.firstName).toBe('Marie');
      expect(user?.lastName).toBe('Dupont');
      expect(user?.email).toBe('marie.dupont@example.com');
      expect(user?.role).toBe('student');
      done();
    });
  });

  it('should get user by id', done => {
    service.getUserById('user-001').subscribe(user => {
      expect(user).toBeTruthy();
      expect(user?.id).toBe('user-001');
      done();
    });
  });

  it('should return null for unknown user id', done => {
    service.getUserById('unknown').subscribe(user => {
      expect(user).toBeNull();
      done();
    });
  });

  it('should update user profile', done => {
    const updatedUser: User = {
      id: 'user-001',
      email: 'marie.dupont@example.com',
      firstName: 'Marie Updated',
      lastName: 'Dupont Updated',
      role: 'student',
    };

    service.updateProfile(updatedUser).subscribe(user => {
      expect(user).toBeTruthy();
      expect(user.firstName).toBe('Marie Updated');
      expect(user.lastName).toBe('Dupont Updated');
      expect(user.updatedAt).toBeTruthy();
      done();
    });
  });

  it('should upload avatar', done => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    service.uploadAvatar(file).subscribe(avatarUrl => {
      expect(avatarUrl).toBeTruthy();
      expect(typeof avatarUrl).toBe('string');
      done();
    });
  });
});
