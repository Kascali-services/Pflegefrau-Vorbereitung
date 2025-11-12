import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow navigation when user is authenticated', done => {
    // Login user
    authService.login('test@example.com', 'password123').subscribe(() => {
      TestBed.runInInjectionContext(() => {
        const result = authGuard(mockRoute, mockState);
        expect(result).toBe(true);
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  });

  it('should block navigation and redirect when user is not authenticated', () => {
    TestBed.runInInjectionContext(() => {
      const result = authGuard(mockRoute, mockState);
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  it('should block navigation after logout', done => {
    // First login
    authService.login('test@example.com', 'password123').subscribe(() => {
      // Then logout
      authService.logout().subscribe(() => {
        TestBed.runInInjectionContext(() => {
          const result = authGuard(mockRoute, mockState);
          expect(result).toBe(false);
          expect(router.navigate).toHaveBeenCalledWith(['/']);
          done();
        });
      });
    });
  });
});
