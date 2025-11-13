# Auth Service Integration Documentation

## Overview
The frontend Angular application now communicates with the backend auth service via the API gateway for authentication and authorization.

## Architecture

```
Angular Frontend → API Gateway (port 8000) → Auth Service (port 8001) → PostgreSQL
```

## Configuration

### Environment Configuration
- **Development**: `src/environments/environment.ts` - Gateway URL: `http://localhost:8000`
- **Production**: `src/environments/environment.prod.ts` - To be configured based on deployment

### API Endpoints

All authentication requests are made to the gateway at `/api/auth`:

#### POST /api/auth/register
- **Request**: `{ email, password, firstName, lastName, empfehlungsnummer? }`
- **Response**: `{ user: {...}, token: string }`
- **Success**: Auto-login with JWT token stored in localStorage

#### POST /api/auth/login
- **Request**: `{ email, password }`
- **Response**: `{ user: {...}, token: string }`
- **Success**: JWT token stored in localStorage, user state updated

#### POST /api/auth/logout
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: string }`
- **Success**: Token and user data cleared from localStorage

#### POST /api/auth/reset-password
- **Request**: `{ email }`
- **Response**: `{ message: string }`
- **Success**: Password reset email initiated

## Implementation Details

### JWT Token Management

1. **Storage**: JWT tokens are stored in `localStorage` under the key `authToken`
2. **Injection**: The `authInterceptor` automatically adds `Authorization: Bearer {token}` header to all HTTP requests
3. **Lifecycle**: Tokens are cleared on logout or authentication errors

### User State Management

The `AuthService` maintains two BehaviorSubjects:
- `isAuthenticatedSubject`: Boolean indicating authentication status
- `currentUserSubject`: Current user object or null

State is persisted in localStorage:
- `currentUser`: User object (JSON)
- `authToken`: JWT token (string)

### Error Handling

HTTP errors are caught and converted to user-friendly German messages:
- **401 Unauthorized**: "E-Mail oder Passwort ungültig"
- **400 Bad Request**: "Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben."
- **500 Server Error**: "Serverfehler. Bitte versuchen Sie es später erneut."

Special handling for registration errors:
- Duplicate email: "Diese E-Mail wird bereits verwendet"

## Testing

### Unit Tests
All tests use `HttpClientTestingModule` to mock HTTP requests and responses.

Example test setup:
```typescript
TestBed.configureTestingModule({
  providers: [provideHttpClient(), provideHttpClientTesting()],
});
```

### Test Utilities
- `src/app/core/testing/http-test-providers.ts` provides helper function `getHttpTestProviders()`
- Tests mock HTTP responses using `HttpTestingController`

## Usage Example

### Login Component
```typescript
this.authService.login(email, password).subscribe({
  next: (user) => {
    // User authenticated, token stored
    this.router.navigate(['/dashboard']);
  },
  error: (error) => {
    // Show error message to user
    this.errorMessage = error.message;
  }
});
```

### Protected Routes
Routes use `authGuard` which checks `AuthService.isAuthenticated()`:
```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  component: DashboardComponent
}
```

## Migration from Mock to Real Backend

The implementation replaced the previous mock-based authentication system with real HTTP calls:

### Before (Mock)
- Simulated network delays with `setTimeout`
- In-memory user database
- No actual authentication validation

### After (Real Backend)
- HTTP calls to gateway/auth-service
- JWT token-based authentication
- Server-side validation and password hashing
- Persistent sessions via localStorage

## Security Considerations

1. **JWT Storage**: Tokens are stored in localStorage (XSS vulnerable). Consider upgrading to httpOnly cookies in production.
2. **HTTPS**: All production traffic should use HTTPS to prevent token interception
3. **Token Expiry**: Implement token refresh mechanism for long-lived sessions
4. **CORS**: Gateway must be configured with appropriate CORS settings

## Docker Deployment

The application works with the docker-compose setup:
- Gateway: `http://localhost:8000`
- Auth Service: `http://localhost:8001` (internal)
- Frontend: Connects to gateway

### Running with Docker
```bash
docker-compose up gateway auth-service postgres redis
```

The frontend development server will connect to the gateway at `http://localhost:8000`.
