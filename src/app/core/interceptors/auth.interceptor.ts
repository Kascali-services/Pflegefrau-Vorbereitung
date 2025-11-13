import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth Interceptor - Adds JWT token to outgoing HTTP requests
 * Automatically attaches the Authorization header with Bearer token if available
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from localStorage
  const token = localStorage.getItem('authToken');

  // If token exists, clone the request and add Authorization header
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  // If no token, proceed with original request
  return next(req);
};
