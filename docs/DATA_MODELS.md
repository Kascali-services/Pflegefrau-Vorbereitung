# Data Models and Database Documentation

This document describes the complete data model structure, database schema, and services for the medical education platform.

## Overview

The platform uses a hierarchical structure with proper database normalization:
- **Courses** contain **Lessons**
- **Lessons** can have multiple **Lesson Contents** (text, video, image)
- **Lessons** can have optional **Quizzes**
- **Quizzes** contain **Questions** with multiple **Options**
- **User Progress** tracks completion, attempts, and scores
- **User Answers** stores detailed quiz attempt data

## Database Schema

The complete MySQL database schema is available in the `database/` directory:

- **database/schema.sql** - Complete database schema with tables, views, triggers
- **database/ERD.md** - Entity Relationship Diagram and detailed table relationships
- **database/MIGRATION.md** - Step-by-step migration guide from mock data to real database
- **database/README.md** - Quick start guide and overview

### Database Tables

The schema consists of 12 main tables:

#### Core Content Tables
1. **courses** - Course/module information
2. **lessons** - Individual lessons within courses
3. **lesson_contents** - Content items (text, video, image) within lessons

#### Quiz Tables
4. **quizzes** - Quizzes associated with lessons
5. **quiz_questions** - Questions within quizzes
6. **quiz_options** - Answer options for questions

#### User Tables
7. **users** - Platform users (students, instructors, admins)
8. **user_course_enrollments** - User enrollments in courses

#### Progress Tracking Tables
9. **user_lesson_progress** - User progress through lessons
10. **user_quiz_attempts** - Individual quiz attempts by users
11. **user_answers** - Individual answers given in quiz attempts

### Key Features

- **Data Integrity**: Foreign key constraints, cascading deletes, unique constraints
- **Performance**: Strategic indexes, composite indexes, materialized views
- **Automation**: Triggers for counters (lessons_count, questions_count) and aggregations
- **Flexibility**: Support for multiple content types per lesson

## TypeScript Models Location

All models are located in `src/app/models/`:
- `course.model.ts` - Course, Lesson, LessonContent, Quiz, Question, QuizOption
- `progress.model.ts` - UserProgress, UserQuizAttempt, QuizAnswer, UserAnswer
- `user.model.ts` - User, UserCourseEnrollment
- `index.ts` - Barrel export file

## Database-to-TypeScript Mapping

| Database Table | TypeScript Interface | File |
|----------------|---------------------|------|
| courses | Course | course.model.ts |
| lessons | Lesson | course.model.ts |
| lesson_contents | LessonContent | course.model.ts |
| quizzes | Quiz | course.model.ts |
| quiz_questions | Question | course.model.ts |
| quiz_options | QuizOption | course.model.ts |
| users | User | user.model.ts |
| user_course_enrollments | UserCourseEnrollment | user.model.ts |
| user_lesson_progress | UserProgress | progress.model.ts |
| user_quiz_attempts | UserQuizAttempt | progress.model.ts |
| user_answers | UserAnswer | progress.model.ts |

## Service Location

The CourseService is located in `src/app/core/services/`:
- `course.service.ts` - Main service implementation
- `course.service.spec.ts` - Unit tests
- `mock-data.ts` - Mock data (for development, will be replaced by database)
- `index.ts` - Barrel export file

## Quick Start

### Using Mock Data (Current Implementation)

```typescript
import { CourseService } from '@app/core/services';
import { Course, UserProgress } from '@app/models';

// In your component
private courseService = inject(CourseService);

// Get all courses
this.courseService.getAllCourses().subscribe(courses => {
  console.log(courses);
});

// Mark lesson as completed
this.courseService.markLessonCompleted('lesson-1').subscribe();

// Track progress
this.courseService.getCourseProgress('course-1').subscribe(progress => {
  console.log('Progress:', progress.progress + '%');
});
```

### Using Database Backend (After Migration)

1. Set up the database using `database/schema.sql`
2. Implement backend API (see `database/MIGRATION.md` for FastAPI example)
3. Update `environment.ts` with API URL
4. Update `CourseService` to use HttpClient

```typescript
// After migration
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`);
  }

  getCourseById(courseId: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/courses/${courseId}`);
  }
  
  // ... other methods
}
```

## Model Interfaces

### Course (courses table)
```typescript
interface Course {
  id: string;                                      // INT PK
  title: string;                                   // VARCHAR(255)
  description: string;                             // TEXT
  thumbnailUrl?: string;                           // VARCHAR(500)
  level: 'beginner' | 'intermediate' | 'advanced'; // ENUM
  durationMinutes: number;                         // INT
  lessonsCount: number;                            // INT
  createdAt?: Date;                                // DATETIME
  updatedAt?: Date;                                // DATETIME
}
```

### Lesson (lessons table)
```typescript
interface Lesson {
  id: string;                                // INT PK
  courseId: string;                          // INT FK → courses.id
  title: string;                             // VARCHAR(255)
  description?: string;                      // TEXT
  contentMdPath?: string;                    // VARCHAR(500) - legacy
  durationMinutes: number;                   // INT
  orderIndex: number;                        // INT
  type: 'text' | 'video' | 'interactive';   // ENUM
  createdAt?: Date;                          // DATETIME
  updatedAt?: Date;                          // DATETIME
}
```

### LessonContent (lesson_contents table)
```typescript
interface LessonContent {
  id: string;                          // INT PK
  lessonId: string;                    // INT FK → lessons.id
  contentType: 'text' | 'video' | 'image'; // ENUM
  contentValue: string;                // TEXT
  orderIndex: number;                  // INT
  createdAt?: Date;                    // DATETIME
}
```

### Quiz (quizzes table)
```typescript
interface Quiz {
  id: string;              // INT PK
  lessonId: string;        // INT FK → lessons.id
  title: string;           // VARCHAR(255)
  passingScore: number;    // INT (percentage)
  questionsCount: number;  // INT
  timeLimitMinutes?: number; // INT
  createdAt?: Date;        // DATETIME
}
```

### Question (quiz_questions table)
```typescript
interface Question {
  id: string;                      // INT PK
  quizId: string;                  // INT FK → quizzes.id
  questionText: string;            // TEXT
  type: 'single' | 'multiple';     // ENUM
  explanation?: string;            // TEXT
  orderIndex: number;              // INT
  points: number;                  // INT
  createdAt?: Date;                // DATETIME
}
```

### QuizOption (quiz_options table)
```typescript
interface QuizOption {
  id: string;          // INT PK
  questionId: string;  // INT FK → quiz_questions.id
  optionText: string;  // TEXT
  isCorrect: boolean;  // BOOLEAN
  orderIndex: number;  // INT
  createdAt?: Date;    // DATETIME
}
```

### UserProgress (user_lesson_progress table)
```typescript
interface UserProgress {
  id: string;                  // INT PK
  userId: string | null;       // INT FK → users.id
  lessonId: string;            // INT FK → lessons.id
  isCompleted: boolean;        // BOOLEAN
  bestScore: number;           // INT
  attemptCount: number;        // INT
  timeSpentMinutes: number;    // INT
  lastAttemptAt?: Date;        // DATETIME
  completedAt?: Date;          // DATETIME
  createdAt?: Date;            // DATETIME
  updatedAt?: Date;            // DATETIME
}
```

### UserQuizAttempt (user_quiz_attempts table)
```typescript
interface UserQuizAttempt {
  id: string;                  // INT PK
  userId: string | null;       // INT FK → users.id
  quizId: string;              // INT FK → quizzes.id
  lessonId: string;            // INT FK → lessons.id
  score: number;               // DECIMAL(5,2)
  passed: boolean;             // BOOLEAN
  attemptNumber: number;       // INT
  timeTakenMinutes?: number;   // INT
  answers: QuizAnswer[];       // JSONB or use user_answers table
  startedAt?: Date;            // DATETIME
  completedAt?: Date;          // DATETIME
}
```

### UserAnswer (user_answers table)
```typescript
interface UserAnswer {
  id: string;           // INT PK
  attemptId: string;    // INT FK → user_quiz_attempts.id
  questionId: string;   // INT FK → quiz_questions.id
  optionId: string;     // INT FK → quiz_options.id
  isCorrect: boolean;   // BOOLEAN
  answeredAt?: Date;    // DATETIME
}
```

## Implementation Notes

### Multiple Content Types per Lesson

The new schema supports multiple content items per lesson via the `lesson_contents` table:

```typescript
// Example: Lesson with mixed content
const lessonContents: LessonContent[] = [
  {
    id: '1',
    lessonId: 'lesson-1',
    contentType: 'text',
    contentValue: '# Introduction\n\nWelcome to the lesson...',
    orderIndex: 1
  },
  {
    id: '2',
    lessonId: 'lesson-1',
    contentType: 'video',
    contentValue: '/assets/videos/lesson-intro.mp4',
    orderIndex: 2
  },
  {
    id: '3',
    lessonId: 'lesson-1',
    contentType: 'image',
    contentValue: '/assets/images/diagram.png',
    orderIndex: 3
  }
];
```

### Quiz Answer Storage

Two approaches for storing user answers:

1. **JSONB in UserQuizAttempt** (current mock data approach):
   - Stores all answers as JSON in `answers` field
   - Good for simple querying of complete attempts
   - Less flexible for detailed analytics

2. **Normalized in user_answers table** (database schema approach):
   - Each answer is a separate row
   - Better for analytics and reporting
   - Easier to query specific questions/options
   - Recommended for production

### Migration Path

For existing code using mock data:

1. Database schema is backward compatible with current TypeScript interfaces
2. Main difference: `lesson_contents` table replaces single `contentMdPath` field
3. `UserAnswer` table provides normalized alternative to JSONB `answers` field
4. No breaking changes required for existing components

## Next Steps

1. **Database Setup**: Run `database/schema.sql` to create tables
2. **Backend API**: Follow `database/MIGRATION.md` to implement REST API
3. **Frontend Update**: Replace mock data with HTTP calls
4. **Testing**: Verify all features work with real database
5. **Deployment**: Deploy database, backend, and frontend

## Additional Resources

- Database ERD: `database/ERD.md`
- Migration Guide: `database/MIGRATION.md`
- Database Schema: `database/schema.sql`
- Quick Start: `database/README.md`

For detailed documentation, see the inline comments in the model and service files.
