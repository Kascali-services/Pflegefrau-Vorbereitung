# Auth Service Integration Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          Angular Application (Port 4200)                   │  │
│  │                                                             │  │
│  │  ┌─────────────────┐        ┌───────────────────────┐     │  │
│  │  │ Login Component │───────▶│   Auth Service        │     │  │
│  │  └─────────────────┘        │                       │     │  │
│  │                              │ - login()            │     │  │
│  │  ┌─────────────────┐        │ - register()         │     │  │
│  │  │Register Component│───────▶│ - logout()           │     │  │
│  │  └─────────────────┘        │ - resetPassword()    │     │  │
│  │                              │                       │     │  │
│  │  ┌─────────────────┐        │ Uses: HttpClient     │     │  │
│  │  │  Auth Guard     │────┐   └───────────────────────┘     │  │
│  │  └─────────────────┘    │            │                    │  │
│  │                         │            │                    │  │
│  │                         │   ┌────────▼───────────┐        │  │
│  │                         │   │  Auth Interceptor  │        │  │
│  │                         │   │                    │        │  │
│  │                         │   │ Adds: Authorization│        │  │
│  │                         │   │ Header: Bearer{JWT}│        │  │
│  │                         │   └────────┬───────────┘        │  │
│  │                         │            │                    │  │
│  └─────────────────────────┼────────────┼────────────────────┘  │
│                            │            │                       │
│  ┌─────────────────────────▼────────────▼────────────────────┐ │
│  │              localStorage                                  │ │
│  │  - authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." │ │
│  │  - currentUser: { id, email, firstName, lastName, ... }   │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                │ HTTP Requests
                                │
┌───────────────────────────────▼────────────────────────────────┐
│              API Gateway (Port 8000)                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Gateway Routes                                         │    │
│  │                                                          │    │
│  │  /api/auth/* ──────▶ http://auth-service:8001          │    │
│  │  /api/users/* ─────▶ http://user-service:8002          │    │
│  │  /api/courses/* ───▶ http://course-service:8003        │    │
│  │  ...                                                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Features:                                                       │
│  - Rate Limiting                                                 │
│  - Caching (Redis)                                              │
│  - CORS Handling                                                │
│  - Request Logging                                              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               │ Forward to Service
                               │
┌──────────────────────────────▼────────────────────────────────┐
│           Auth Service (Port 8001)                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  FastAPI Application                                     │  │
│  │                                                           │  │
│  │  Endpoints:                                              │  │
│  │  - POST /api/auth/register                              │  │
│  │  - POST /api/auth/login                                 │  │
│  │  - POST /api/auth/logout                                │  │
│  │  - POST /api/auth/reset-password                        │  │
│  │  - POST /api/auth/reset-password/confirm                │  │
│  │  - GET  /api/auth/verify                                │  │
│  │  - GET  /health                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                               │                                 │
│                               │ SQL Queries                     │
│                               │                                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│           PostgreSQL Database (Port 5432)                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  users table                                             │    │
│  │  - id, email, password_hash, first_name, last_name       │    │
│  │  - role, aktenzeichen, created_at, updated_at            │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### 1. User Login Flow

```
User                 Angular App           Gateway          Auth Service      Database
  │                      │                    │                  │               │
  │  Enter credentials   │                    │                  │               │
  │─────────────────────▶│                    │                  │               │
  │                      │                    │                  │               │
  │                      │ POST /api/auth/login                  │               │
  │                      │ { email, password }│                  │               │
  │                      │───────────────────▶│                  │               │
  │                      │                    │                  │               │
  │                      │                    │ Forward request  │               │
  │                      │                    │─────────────────▶│               │
  │                      │                    │                  │               │
  │                      │                    │                  │ SELECT * FROM users
  │                      │                    │                  │ WHERE email=?  │
  │                      │                    │                  │───────────────▶│
  │                      │                    │                  │               │
  │                      │                    │                  │ User record   │
  │                      │                    │                  │◀───────────────│
  │                      │                    │                  │               │
  │                      │                    │                  │ Verify password│
  │                      │                    │                  │ Generate JWT   │
  │                      │                    │                  │               │
  │                      │                    │ { user, token }  │               │
  │                      │                    │◀─────────────────│               │
  │                      │ { user, token }    │                  │               │
  │                      │◀───────────────────│                  │               │
  │                      │                    │                  │               │
  │                      │ Store in localStorage:                │               │
  │                      │ - authToken        │                  │               │
  │                      │ - currentUser      │                  │               │
  │                      │                    │                  │               │
  │  Redirect to dashboard                    │                  │               │
  │◀─────────────────────│                    │                  │               │
  │                      │                    │                  │               │
```

### 2. Protected Request Flow

```
User                 Angular App           Gateway          Auth Service
  │                      │                    │                  │
  │  Access protected    │                    │                  │
  │  route/resource      │                    │                  │
  │─────────────────────▶│                    │                  │
  │                      │                    │                  │
  │                      │ Auth Interceptor   │                  │
  │                      │ reads authToken    │                  │
  │                      │ from localStorage  │                  │
  │                      │                    │                  │
  │                      │ GET /api/protected/resource           │
  │                      │ Authorization: Bearer <JWT>           │
  │                      │───────────────────▶│                  │
  │                      │                    │                  │
  │                      │                    │ Verify JWT       │
  │                      │                    │ Extract user_id  │
  │                      │                    │                  │
  │                      │                    │ Forward with     │
  │                      │                    │ user context     │
  │                      │                    │─────────────────▶│
  │                      │                    │                  │
  │                      │                    │ Process request  │
  │                      │                    │◀─────────────────│
  │                      │ Response           │                  │
  │                      │◀───────────────────│                  │
  │  Display data        │                    │                  │
  │◀─────────────────────│                    │                  │
  │                      │                    │                  │
```

### 3. Logout Flow

```
User                 Angular App           Gateway          Auth Service
  │                      │                    │                  │
  │  Click Logout        │                    │                  │
  │─────────────────────▶│                    │                  │
  │                      │                    │                  │
  │                      │ POST /api/auth/logout                 │
  │                      │ Authorization: Bearer <JWT>           │
  │                      │───────────────────▶│                  │
  │                      │                    │                  │
  │                      │                    │ Forward          │
  │                      │                    │─────────────────▶│
  │                      │                    │                  │
  │                      │                    │ Invalidate token │
  │                      │                    │ (if blacklist)   │
  │                      │                    │                  │
  │                      │                    │ { message: "OK" }│
  │                      │                    │◀─────────────────│
  │                      │ { message: "OK" }  │                  │
  │                      │◀───────────────────│                  │
  │                      │                    │                  │
  │                      │ Clear localStorage:│                  │
  │                      │ - remove authToken │                  │
  │                      │ - remove currentUser                  │
  │                      │                    │                  │
  │  Redirect to home    │                    │                  │
  │◀─────────────────────│                    │                  │
  │                      │                    │                  │
```

## Key Components

### Frontend (Angular)
- **AuthService**: Manages authentication state and HTTP calls
- **AuthInterceptor**: Injects JWT tokens into requests
- **AuthGuard**: Protects routes from unauthorized access
- **localStorage**: Persists auth state across page reloads

### Backend (FastAPI)
- **Auth Service**: Handles authentication logic
- **JWT**: Stateless authentication tokens
- **PostgreSQL**: User credential storage
- **bcrypt**: Password hashing

### Infrastructure
- **Gateway**: Route aggregation, rate limiting, caching
- **Redis**: Session caching, rate limit counters
- **Docker**: Container orchestration

## Security Features

1. **Password Hashing**: bcrypt on backend
2. **JWT Tokens**: Stateless authentication
3. **HTTPS**: Encrypted transport (production)
4. **CORS**: Cross-origin request control
5. **Rate Limiting**: Prevent brute force attacks
6. **Input Validation**: Both frontend and backend
7. **SQL Injection**: Protected by ORM (SQLAlchemy)
8. **XSS**: Angular's built-in sanitization
