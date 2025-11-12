# Database Documentation

This directory contains the database schema and documentation for the Pflegefachfrau Vorbereitung platform.

## Files

- **schema.sql** - Complete MySQL/MariaDB database schema with all tables, views, triggers, and sample data
- **ERD.md** - Entity Relationship Diagram and table relationships documentation
- **MIGRATION.md** - Migration guide for implementing the database backend

## Quick Start

### Creating the Database

1. Ensure you have MySQL 8.0+ or MariaDB 10.5+ installed
2. Run the schema file:

```bash
mysql -u root -p < database/schema.sql
```

Or import via MySQL Workbench or phpMyAdmin.

### Database Structure Overview

The database consists of 12 main tables organized into 4 functional groups:

#### 1. Core Content Tables
- **courses** - Course/module information
- **lessons** - Individual lessons within courses
- **lesson_contents** - Content items (text, video, image) within lessons

#### 2. Quiz Tables
- **quizzes** - Quizzes associated with lessons
- **quiz_questions** - Questions within quizzes
- **quiz_options** - Answer options for questions

#### 3. User Tables
- **users** - Platform users (students, instructors, admins)
- **user_course_enrollments** - User enrollments in courses

#### 4. Progress Tracking Tables
- **user_lesson_progress** - User progress through lessons
- **user_quiz_attempts** - Individual quiz attempts by users
- **user_answers** - Individual answers given in quiz attempts

## Key Features

### Data Integrity
- Foreign key constraints ensure referential integrity
- Cascading deletes maintain consistency
- Unique constraints prevent duplicate enrollments

### Performance Optimization
- Strategic indexes on frequently queried columns
- Composite indexes for common query patterns
- Views for complex aggregations

### Automated Data Management
- Triggers automatically update counters (lessons_count, questions_count)
- Triggers maintain course duration based on lesson durations
- Automatic timestamps for auditing

## Usage Examples

See the comments at the end of `schema.sql` for useful query examples.

## Integration with Frontend

The TypeScript interfaces in `src/app/models/` map directly to the database tables:

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

## Next Steps

1. Review the ERD diagram: `database/ERD.md`
2. Follow the migration guide: `database/MIGRATION.md`
3. Update environment configuration to connect to the database
4. Implement backend API endpoints (FastAPI recommended)
5. Update Angular services to use HTTP client instead of mock data

## Support

For questions or issues, please refer to the main project README or create an issue in the repository.
