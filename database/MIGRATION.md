# Database Migration Guide

This guide walks you through implementing the database backend for the Pflegefachfrau Vorbereitung platform.

## Overview

The platform currently uses in-memory mock data (see `src/app/core/services/mock-data.ts`). This guide will help you migrate to a real database backend.

## Prerequisites

- MySQL 8.0+ or MariaDB 10.5+ installed
- Python 3.8+ (if using FastAPI backend)
- Node.js 20+ (for Angular frontend)
- Basic knowledge of SQL and REST APIs

## Migration Steps

### Step 1: Database Setup

#### 1.1 Create the Database

```bash
# Connect to MySQL
mysql -u root -p

# Or use the schema file directly
mysql -u root -p < database/schema.sql
```

#### 1.2 Verify Installation

```sql
USE pflegefrau_vorbereitung;
SHOW TABLES;
-- Should show 12 tables

DESCRIBE courses;
DESCRIBE lessons;
-- etc.
```

#### 1.3 Load Sample Data

The schema file includes sample data. To add more:

```sql
-- Add more courses
INSERT INTO courses (title, description, level) 
VALUES ('Anatomie Grundlagen', 'Einführung in die menschliche Anatomie', 'beginner');

-- Add lessons for the course
INSERT INTO lessons (course_id, title, description, order_index, lesson_type)
VALUES (2, 'Das Herz-Kreislauf-System', 'Aufbau und Funktion des Herzens', 1, 'text');
```

### Step 2: Backend API Implementation

We recommend using **FastAPI** (Python) for the backend, but any REST API framework works.

#### 2.1 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and environment variables
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── course.py
│   │   ├── lesson.py
│   │   ├── quiz.py
│   │   ├── user.py
│   │   └── progress.py
│   ├── schemas/             # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── course.py
│   │   ├── lesson.py
│   │   ├── quiz.py
│   │   ├── user.py
│   │   └── progress.py
│   ├── routers/             # API endpoints
│   │   ├── __init__.py
│   │   ├── courses.py
│   │   ├── lessons.py
│   │   ├── quizzes.py
│   │   ├── auth.py
│   │   └── progress.py
│   └── dependencies.py      # Dependency injection (auth, db session)
├── alembic/                 # Database migrations
│   └── versions/
├── requirements.txt
└── README.md
```

#### 2.2 Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy pymysql python-dotenv pydantic python-jose[cryptography] passlib[bcrypt]
```

#### 2.3 Basic FastAPI Setup

**app/database.py**:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:password@localhost/pflegefrau_vorbereitung"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**app/main.py**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import courses, lessons, quizzes, auth, progress

app = FastAPI(
    title="Pflegefachfrau Vorbereitung API",
    version="1.0.0"
)

# CORS configuration for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["lessons"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])

@app.get("/")
def read_root():
    return {"message": "Pflegefachfrau Vorbereitung API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### 2.4 Example Router (Courses)

**app/routers/courses.py**:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Course])
def get_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all courses"""
    courses = db.query(models.Course).offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=schemas.Course)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get a specific course"""
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.get("/{course_id}/lessons", response_model=List[schemas.Lesson])
def get_course_lessons(course_id: int, db: Session = Depends(get_db)):
    """Get all lessons for a course"""
    lessons = db.query(models.Lesson).filter(
        models.Lesson.course_id == course_id
    ).order_by(models.Lesson.order_index).all()
    return lessons
```

#### 2.5 Run the Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit http://localhost:8000/docs for interactive API documentation.

### Step 3: Frontend Integration

#### 3.1 Update Environment Configuration

**src/environments/environment.ts**:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
};
```

**src/environments/environment.prod.ts**:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api',
};
```

#### 3.2 Update CourseService

Replace mock data methods with HTTP calls:

**src/app/core/services/course.service.ts**:
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Lesson, Quiz } from '@app/models';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`);
  }

  getCourseById(courseId: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/courses/${courseId}`);
  }

  getLessonsByCourseId(courseId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/courses/${courseId}/lessons`);
  }

  getLessonById(lessonId: string): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.apiUrl}/lessons/${lessonId}`);
  }

  getQuizByLessonId(lessonId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/lessons/${lessonId}/quiz`);
  }

  // ... other methods
}
```

#### 3.3 Update app.config.ts

Ensure HttpClient is provided:

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),  // Add this
  ],
};
```

### Step 4: Authentication

#### 4.1 JWT Token Authentication

**Backend** (app/routers/auth.py):
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app import models, schemas, security
from app.database import get_db

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=30)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
```

**Frontend** (HTTP Interceptor):
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
```

Add to app.config.ts:
```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```

### Step 5: Testing

#### 5.1 Test Database Connectivity

```sql
-- Test data retrieval
SELECT c.*, COUNT(l.id) as lesson_count
FROM courses c
LEFT JOIN lessons l ON c.id = l.course_id
GROUP BY c.id;
```

#### 5.2 Test API Endpoints

```bash
# Get all courses
curl http://localhost:8000/api/courses

# Get specific course
curl http://localhost:8000/api/courses/1

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password"
```

#### 5.3 Test Angular Integration

```bash
cd /path/to/angular/project
ng serve

# Visit http://localhost:4200
# Check browser console for API calls
# Verify data is loaded from backend
```

### Step 6: Deployment

#### 6.1 Database (Production)

Consider using:
- **AWS RDS** (MySQL)
- **Google Cloud SQL** (MySQL)
- **Azure Database for MySQL**
- **DigitalOcean Managed Database**

Update connection string in backend configuration.

#### 6.2 Backend API

Deploy using:
- **Docker** + **Docker Compose**
- **AWS Elastic Beanstalk**
- **Heroku**
- **Google Cloud Run**
- **Azure App Service**

#### 6.3 Frontend

Deploy using:
- **Netlify**
- **Vercel**
- **Firebase Hosting**
- **AWS S3** + **CloudFront**
- **GitHub Pages**

Update `environment.prod.ts` with production API URL.

## Troubleshooting

### Common Issues

#### Connection Refused
- Check MySQL is running: `sudo systemctl status mysql`
- Verify port 3306 is open
- Check firewall settings

#### Authentication Errors
- Verify database user permissions
- Check password in connection string
- Ensure database exists

#### CORS Issues
- Add Angular dev server URL to CORS allowed origins
- In production, add production frontend URL

#### Foreign Key Constraint Errors
- Ensure parent records exist before inserting child records
- Use transactions for multi-table inserts
- Check cascade delete settings

### Useful Commands

```bash
# Check database size
mysql> SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'pflegefrau_vorbereitung';

# Show table structure
mysql> DESCRIBE courses;

# Check foreign keys
mysql> SELECT 
    TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, 
    REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'pflegefrau_vorbereitung'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

## Performance Optimization

### Database Level
1. Add indexes for frequently queried columns
2. Use EXPLAIN to analyze query performance
3. Consider query result caching
4. Use connection pooling
5. Regular database maintenance (OPTIMIZE TABLE)

### API Level
1. Implement pagination for large result sets
2. Use response caching (Redis)
3. Implement rate limiting
4. Use database connection pooling
5. Add API response compression

### Frontend Level
1. Use lazy loading for routes
2. Implement virtual scrolling for long lists
3. Cache API responses (HttpClient interceptor)
4. Use OnPush change detection strategy
5. Implement pagination in UI

## Backup and Maintenance

### Regular Backups

```bash
# Full database backup
mysqldump -u root -p pflegefrau_vorbereitung > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u root -p pflegefrau_vorbereitung < backup_20250112.sql
```

### Automated Backups

Set up cron job:
```bash
# Daily backup at 2 AM
0 2 * * * /usr/bin/mysqldump -u root -p'password' pflegefrau_vorbereitung > /backups/db_$(date +\%Y\%m\%d).sql
```

## Security Checklist

- [ ] Use environment variables for sensitive data
- [ ] Enable SSL/TLS for database connections
- [ ] Implement JWT authentication
- [ ] Use HTTPS in production
- [ ] Sanitize user inputs
- [ ] Implement rate limiting
- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement proper CORS policy
- [ ] Use strong password hashing (bcrypt)
- [ ] Implement CSRF protection
- [ ] Regular database backups
- [ ] Monitor for suspicious activity

## Next Steps

After completing the migration:

1. **Add More Features**
   - File uploads for lesson content
   - Rich text editor for content creation
   - Video streaming integration
   - Discussion forums

2. **Enhance Analytics**
   - Learning analytics dashboard
   - Progress reports
   - Time-on-task tracking
   - Completion certificates

3. **Improve UX**
   - Offline mode (PWA)
   - Push notifications
   - Mobile apps (Ionic/React Native)
   - Accessibility improvements

4. **Scale**
   - Load balancing
   - Database replication
   - CDN for static assets
   - Caching strategy

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Angular HttpClient Guide](https://angular.io/guide/http)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Support

For questions or issues:
1. Check the database/ERD.md for schema details
2. Review the API documentation at /docs endpoint
3. Check the main project README
4. Create an issue in the repository
