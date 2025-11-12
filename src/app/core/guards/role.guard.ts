import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Role guard - Protects routes that require specific user roles
 * Only allows content_manager and admin roles to access
 */
export const roleGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (user && (user.role === 'content_manager' || user.role === 'admin')) {
        return true;
      }
      // Redirect to home if user doesn't have required role
      router.navigate(['/']);
      return false;
    })
  );
};
