import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Admin guard - Protects routes that require admin role only
 * Only allows users with admin role to access
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (user && user.role === 'admin') {
        return true;
      }
      // Redirect to home if user doesn't have admin role
      router.navigate(['/']);
      return false;
    })
  );
};
