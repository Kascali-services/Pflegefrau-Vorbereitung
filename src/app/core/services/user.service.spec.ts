import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../../models/user.model';
import { AuthService } from './auth.service';
import { UserResponse, AvatarUploadResponse } from '../interfaces/user-api.interface';
import { environment } from '../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let authService: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 'user-001',
    email: 'marie.dupont@example.com',
    firstName: 'Marie',
    lastName: 'Dupont',
    role: 'student',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lastLoginAt: new Date('2025-02-10'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(UserService);
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Setup: login a user before each test
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'fake-jwt-token');
    authService['checkAuthState']();
  });

  afterEach(() => {
    // Cleanup: clear localStorage after each test
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    httpMock.verify();
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

  it('should get user by id for current user', done => {
    service.getUserById('user-001').subscribe(user => {
      expect(user).toBeTruthy();
      expect(user?.id).toBe('user-001');
      done();
    });
  });

  it('should return error for different user id (no admin access)', done => {
    service.getUserById('other-user').subscribe({
      next: () => {
        fail('Should have thrown an error');
      },
      error: error => {
        expect(error.message).toBe('Zugriff verweigert');
        done();
      },
    });
  });

  it('should update user profile via API', done => {
    const updatedUser: User = {
      id: 'user-001',
      email: 'marie.dupont@example.com',
      firstName: 'Marie Updated',
      lastName: 'Dupont Updated',
      role: 'student',
    };

    const mockResponse: UserResponse = {
      id: 'user-001',
      email: 'marie.dupont@example.com',
      firstName: 'Marie Updated',
      lastName: 'Dupont Updated',
      role: 'student',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-02-10T12:00:00Z',
    };

    service.updateProfile(updatedUser).subscribe(user => {
      expect(user).toBeTruthy();
      expect(user.firstName).toBe('Marie Updated');
      expect(user.lastName).toBe('Dupont Updated');
      expect(user.updatedAt).toBeTruthy();
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/users/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      firstName: 'Marie Updated',
      lastName: 'Dupont Updated',
      avatarUrl: undefined,
      bio: undefined,
      specialties: undefined,
    });
    req.flush(mockResponse);
  });

  it('should handle update profile error', done => {
    const updatedUser: User = {
      id: 'user-001',
      email: 'marie.dupont@example.com',
      firstName: 'M', // Too short
      lastName: 'Dupont',
      role: 'student',
    };

    service.updateProfile(updatedUser).subscribe({
      next: () => {
        fail('Should have thrown an error');
      },
      error: error => {
        expect(error.message).toBe('First name must be at least 2 characters');
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/users/me`);
    req.flush({ detail: 'First name must be at least 2 characters' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should upload avatar via API', done => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    const mockResponse: AvatarUploadResponse = {
      avatarUrl: '/uploads/avatars/user-001_12345.jpg',
      filename: 'user-001_12345.jpg',
      size: 12345,
      uploadedAt: '2025-02-10T12:00:00Z',
    };

    service.uploadAvatar(file).subscribe(avatarUrl => {
      expect(avatarUrl).toBeTruthy();
      expect(avatarUrl).toBe('/uploads/avatars/user-001_12345.jpg');
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/users/me/avatar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockResponse);
  });

  it('should handle avatar upload error for file too large', done => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    service.uploadAvatar(file).subscribe({
      next: () => {
        fail('Should have thrown an error');
      },
      error: error => {
        expect(error.message).toBe('Datei ist zu groß. Maximale Größe: 5MB');
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/users/me/avatar`);
    req.flush({ detail: 'File too large' }, { status: 413, statusText: 'Request Entity Too Large' });
  });

  it('should handle avatar upload error for invalid file type', done => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

    service.uploadAvatar(file).subscribe({
      next: () => {
        fail('Should have thrown an error');
      },
      error: error => {
        expect(error.message).toBe('Invalid file type');
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/users/me/avatar`);
    req.flush({ detail: 'Invalid file type' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should get all team members', done => {
    const mockTeamMembersResponse = {
      teamMembers: [
        {
          id: 'team-001',
          email: 'team1@example.com',
          firstName: 'Dr. Anna',
          lastName: 'Schmidt',
          role: 'Leiterin der Pflegeausbildung',
          bio: 'Erfahrene Pflegepädagogin',
          specialties: ['Pflegepädagogik', 'Anatomie'],
          avatarUrl: '/assets/team/anna-schmidt.jpg',
        },
      ],
      total: 1,
    };

    service.getAllTeamMembers().subscribe(members => {
      expect(members).toBeTruthy();
      expect(members.length).toBe(1);
      expect(members[0].id).toBe('team-001');
      expect(members[0].bio).toBe('Erfahrene Pflegepädagogin');
      expect(members[0].specialties).toEqual(['Pflegepädagogik', 'Anatomie']);
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/users/team-members`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTeamMembersResponse);
  });

  it('should get team member by id', done => {
    const mockTeamMemberResponse = {
      id: 'team-001',
      email: 'team1@example.com',
      firstName: 'Dr. Anna',
      lastName: 'Schmidt',
      role: 'Leiterin der Pflegeausbildung',
      bio: 'Erfahrene Pflegepädagogin',
      specialties: ['Pflegepädagogik', 'Anatomie'],
      avatarUrl: '/assets/team/anna-schmidt.jpg',
    };

    service.getTeamMemberById('team-001').subscribe(member => {
      expect(member).toBeTruthy();
      expect(member.id).toBe('team-001');
      expect(member.bio).toBe('Erfahrene Pflegepädagogin');
      expect(member.specialties).toEqual(['Pflegepädagogik', 'Anatomie']);
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/users/team-members/team-001`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTeamMemberResponse);
  });
});
