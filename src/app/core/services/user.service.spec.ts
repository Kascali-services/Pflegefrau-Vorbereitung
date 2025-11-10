import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a current user', (done) => {
    service.getCurrentUser().subscribe(user => {
      expect(user).toBeTruthy();
      expect(user?.id).toBe('user-001');
      expect(user?.name).toBe('Marie Dupont');
      expect(user?.email).toBe('marie.dupont@example.com');
      done();
    });
  });

  it('should get user by id', (done) => {
    service.getUserById('user-001').subscribe(user => {
      expect(user).toBeTruthy();
      expect(user?.id).toBe('user-001');
      done();
    });
  });

  it('should return null for unknown user id', (done) => {
    service.getUserById('unknown').subscribe(user => {
      expect(user).toBeNull();
      done();
    });
  });
});
