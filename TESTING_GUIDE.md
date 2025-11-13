# Testing Auth Service Integration

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ installed
- npm installed

### Step 1: Start Backend Services

```bash
# From the repository root
docker-compose up gateway auth-service postgres redis
```

Wait for all services to be healthy:
- ✅ Gateway: http://localhost:8000
- ✅ Auth Service: http://localhost:8001
- ✅ PostgreSQL: localhost:5432
- ✅ Redis: localhost:6379

### Step 2: Start Frontend

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm start
```

Frontend will be available at: http://localhost:4200

### Step 3: Test Authentication Flow

#### Test 1: Register New User

1. Navigate to: http://localhost:4200/register
2. Fill in the form:
   - Email: test@example.com
   - Password: password123
   - First Name: Test
   - Last Name: User
   - Empfehlungsnummer: (optional)
3. Click "S'inscrire"
4. Should redirect to dashboard
5. Check browser localStorage:
   - `authToken` should contain JWT
   - `currentUser` should contain user data

#### Test 2: Login

1. Logout (if logged in)
2. Navigate to: http://localhost:4200/login
3. Enter credentials:
   - Email: test@example.com
   - Password: password123
4. Click "Se connecter"
5. Should redirect to dashboard
6. Verify localStorage has authToken and currentUser

#### Test 3: Protected Routes

1. While logged in, access dashboard: http://localhost:4200/dashboard
2. Should load successfully
3. Logout
4. Try to access dashboard again
5. Should redirect to home page

#### Test 4: Logout

1. Login first
2. Click logout button in navigation
3. Should redirect to home page
4. Check localStorage - authToken and currentUser should be removed
5. Try accessing protected routes - should be denied

#### Test 5: Password Reset

1. Navigate to: http://localhost:4200/reset-password
2. Enter email: test@example.com
3. Submit form
4. Should show success message
5. Check backend logs for reset email (email service may not be configured in dev)

### Step 4: Verify Backend Communication

#### Check HTTP Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform login
4. You should see:
   - Request to: http://localhost:8000/api/auth/login
   - Method: POST
   - Request body: `{ email, password }`
   - Response: `{ user: {...}, token: "..." }`

#### Check Authorization Headers

1. Login first
2. Access any protected route
3. In DevTools Network tab, check the request headers
4. Should see: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`

### Step 5: Test Error Scenarios

#### Test Invalid Login

1. Navigate to login page
2. Enter wrong credentials:
   - Email: wrong@example.com
   - Password: wrongpassword
3. Submit form
4. Should show error: "E-Mail oder Passwort ungültig"

#### Test Duplicate Registration

1. Navigate to register page
2. Try to register with existing email: test@example.com
3. Submit form
4. Should show error: "Diese E-Mail wird bereits verwendet"

### Step 6: Verify Database

```bash
# Connect to PostgreSQL
docker exec -it pflegefrau-postgres psql -U pflegefrau -d pflegefrau_db

# View users
SELECT id, email, first_name, last_name, role, created_at FROM users;

# Exit
\q
```

## API Testing with cURL

### Register

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@example.com",
    "password": "password123",
    "firstName": "Curl",
    "lastName": "User"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@example.com",
    "password": "password123"
  }'
```

Save the token from response for next requests.

### Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Health Check

```bash
# Gateway health
curl http://localhost:8000/health

# Auth service health
curl http://localhost:8001/health
```

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker-compose logs gateway
docker-compose logs auth-service

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Frontend Not Connecting

1. Check environment.ts has correct URL: `http://localhost:8000`
2. Check browser console for CORS errors
3. Verify gateway is running: `curl http://localhost:8000/health`

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
docker exec -it pflegefrau-postgres pg_isready -U pflegefrau
```

### CORS Errors

If you see CORS errors, check gateway CORS configuration allows:
- Origin: http://localhost:4200
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization

### Token Not Being Sent

1. Check localStorage has authToken
2. Check auth.interceptor.ts is registered in app.config.ts
3. Check browser DevTools Network tab for Authorization header

## Expected Results

✅ User can register and auto-login
✅ User can login with credentials
✅ JWT token stored in localStorage
✅ Token automatically added to requests
✅ Protected routes are guarded
✅ User can logout
✅ Password reset flow works
✅ Error messages display correctly
✅ No console errors
✅ No security vulnerabilities

## Performance Benchmarks

- Registration: < 500ms
- Login: < 300ms
- Protected request: < 200ms
- Logout: < 200ms

## Browser Compatibility

Tested on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Clean Up

```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: deletes database)
docker-compose down -v

# Stop frontend
Ctrl+C in terminal
```

## Next Steps

After successful testing:
1. Configure production environment
2. Set up CI/CD pipeline
3. Deploy to staging
4. Perform load testing
5. Security audit
6. Production deployment

## Support

For issues or questions:
1. Check IMPLEMENTATION_SUMMARY.md
2. Check docs/AUTH_INTEGRATION.md
3. Check docs/AUTH_FLOW_DIAGRAM.md
4. Review backend-documentation.md
