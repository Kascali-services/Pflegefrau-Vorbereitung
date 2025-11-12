# Entity Relationship Diagram (ERD)

This document describes the entity relationships and database schema for the Pflegefachfrau Vorbereitung platform.

## Overview

The database uses a normalized relational design with clear hierarchies and relationships between entities.

## Core Entity Hierarchy

```
courses (1) ──→ (*) lessons (1) ──→ (*) lesson_contents
                        │
                        └──→ (0..1) quizzes (1) ──→ (*) quiz_questions (1) ──→ (*) quiz_options
```

## User Progress Tracking

```
users (1) ──→ (*) user_course_enrollments (*) ──→ (1) courses
      │
      ├──→ (*) user_lesson_progress (*) ──→ (1) lessons
      │
      └──→ (*) user_quiz_attempts (1) ──→ (*) user_answers
                   │                              │
                   └──→ (1) quizzes               └──→ (1) quiz_options
                            │                              │
                            └──→ (1) lessons               └──→ (1) quiz_questions
```

## Table Relationships

### 1. Content Hierarchy

#### courses → lessons (1:N)
- **Relationship**: One course contains many lessons
- **Foreign Key**: `lessons.course_id` → `courses.id`
- **Cascade**: DELETE CASCADE, UPDATE CASCADE
- **Business Rule**: When a course is deleted, all its lessons are deleted

#### lessons → lesson_contents (1:N)
- **Relationship**: One lesson contains many content items
- **Foreign Key**: `lesson_contents.lesson_id` → `lessons.id`
- **Cascade**: DELETE CASCADE, UPDATE CASCADE
- **Business Rule**: Lessons can have multiple content items (text, video, image) in order

#### lessons → quizzes (1:0..1)
- **Relationship**: One lesson can have zero or one quiz
- **Foreign Key**: `quizzes.lesson_id` → `lessons.id`
- **Constraint**: UNIQUE on `quizzes.lesson_id`
- **Cascade**: DELETE CASCADE, UPDATE CASCADE
- **Business Rule**: Optional quiz per lesson

#### quizzes → quiz_questions (1:N)
- **Relationship**: One quiz contains many questions
- **Foreign Key**: `quiz_questions.quiz_id` → `quizzes.id`
- **Cascade**: DELETE CASCADE, UPDATE CASCADE
- **Business Rule**: Questions are ordered within a quiz

#### quiz_questions → quiz_options (1:N)
- **Relationship**: One question has many answer options
- **Foreign Key**: `quiz_options.question_id` → `quiz_questions.id`
- **Cascade**: DELETE CASCADE, UPDATE CASCADE
- **Business Rule**: At least one option must be marked as correct

### 2. User Management

#### users → user_course_enrollments → courses (N:M)
- **Relationship**: Many-to-many between users and courses
- **Junction Table**: `user_course_enrollments`
- **Foreign Keys**: 
  - `user_course_enrollments.user_id` → `users.id`
  - `user_course_enrollments.course_id` → `courses.id`
- **Constraint**: UNIQUE on (`user_id`, `course_id`)
- **Cascade**: DELETE CASCADE for both FKs
- **Business Rule**: Each user can enroll in multiple courses; each course can have multiple users

### 3. Progress Tracking

#### users → user_lesson_progress → lessons (N:M)
- **Relationship**: Many-to-many tracking user progress in lessons
- **Junction Table**: `user_lesson_progress`
- **Foreign Keys**:
  - `user_lesson_progress.user_id` → `users.id`
  - `user_lesson_progress.lesson_id` → `lessons.id`
- **Constraint**: UNIQUE on (`user_id`, `lesson_id`)
- **Cascade**: DELETE CASCADE for both FKs
- **Business Rule**: Tracks completion status, best score, attempts

#### users → user_quiz_attempts → quizzes (1:N:1)
- **Relationship**: Users can make multiple attempts at quizzes
- **Foreign Keys**:
  - `user_quiz_attempts.user_id` → `users.id`
  - `user_quiz_attempts.quiz_id` → `quizzes.id`
  - `user_quiz_attempts.lesson_id` → `lessons.id`
- **Cascade**: DELETE CASCADE for all FKs
- **Business Rule**: Multiple attempts allowed; tracks score, pass/fail, time

#### user_quiz_attempts → user_answers (1:N)
- **Relationship**: One attempt contains many answers
- **Foreign Key**: `user_answers.attempt_id` → `user_quiz_attempts.id`
- **Cascade**: DELETE CASCADE, UPDATE CASCADE
- **Business Rule**: Stores individual answer choices for review and analytics

#### user_answers → quiz_questions (N:1)
- **Foreign Key**: `user_answers.question_id` → `quiz_questions.id`
- **Cascade**: DELETE CASCADE, UPDATE CASCADE

#### user_answers → quiz_options (N:1)
- **Foreign Key**: `user_answers.option_id` → `quiz_options.id`
- **Cascade**: DELETE CASCADE, UPDATE CASCADE

## Indexes

### Primary Keys
All tables have an auto-incrementing integer primary key named `id`.

### Foreign Key Indexes
All foreign keys have indexes for efficient joins:
- `idx_course_id` on lessons, user_course_enrollments
- `idx_lesson_id` on lesson_contents, quizzes, user_lesson_progress, user_quiz_attempts
- `idx_quiz_id` on quiz_questions, user_quiz_attempts
- `idx_question_id` on quiz_options, user_answers
- `idx_user_id` on user_course_enrollments, user_lesson_progress, user_quiz_attempts

### Performance Indexes
- `idx_level` on courses (for filtering by difficulty)
- `idx_created_at` on courses (for sorting)
- `idx_order_index` on lessons, lesson_contents, quiz_questions, quiz_options (for ordering)
- `idx_is_correct` on quiz_options (for answer validation)
- `idx_is_completed` on user_lesson_progress (for progress queries)
- `idx_passed` on user_quiz_attempts (for pass rate analytics)
- `idx_is_active` on users (for active user queries)
- `idx_role` on users (for role-based queries)

### Composite Indexes
- `idx_user_lesson_progress_composite` on (user_id, lesson_id, is_completed)
- `idx_quiz_attempts_user_quiz` on (user_id, quiz_id, started_at)

### Unique Constraints
- `unique_course_order` on (course_id, order_index) in lessons
- `unique_lesson_content_order` on (lesson_id, order_index) in lesson_contents
- `unique_quiz_question_order` on (quiz_id, order_index) in quiz_questions
- `unique_lesson_quiz` on lesson_id in quizzes
- `unique_user_course` on (user_id, course_id) in user_course_enrollments
- `unique_user_lesson` on (user_id, lesson_id) in user_lesson_progress
- `unique_email` on email in users
- `unique_username` on username in users

## Views

### view_user_course_progress
Aggregates user progress across all courses:
- Calculates completion percentage
- Counts completed vs total lessons
- Tracks last activity timestamp

**Usage**: Dashboard displays, progress reports

### view_user_quiz_performance
Summarizes quiz performance metrics:
- Total attempts per quiz
- Best and average scores
- Pass rate statistics
- Last attempt timestamp

**Usage**: Analytics, performance tracking

## Triggers

### Automatic Counters

#### trg_after_lesson_insert / trg_after_lesson_delete
- **Purpose**: Maintain `courses.lessons_count`
- **Fires**: After INSERT/DELETE on lessons
- **Action**: Increments/decrements the counter

#### trg_after_question_insert / trg_after_question_delete
- **Purpose**: Maintain `quizzes.questions_count`
- **Fires**: After INSERT/DELETE on quiz_questions
- **Action**: Increments/decrements the counter

### Data Aggregation

#### trg_after_lesson_duration_update
- **Purpose**: Keep course duration synchronized
- **Fires**: After UPDATE on lessons.duration_minutes
- **Action**: Recalculates total duration from all lessons

## Data Types

### IDs
- All primary keys: `INT AUTO_INCREMENT`
- All foreign keys: `INT`
- **Note**: Frontend uses `string` for IDs (TypeScript interfaces)

### Text Fields
- Short text (titles, names): `VARCHAR(100-255)`
- Long text (descriptions, content): `TEXT`
- URLs: `VARCHAR(500)`

### Numbers
- Integers: `INT`
- Scores/Percentages: `DECIMAL(5,2)` for user_quiz_attempts.score
- Duration: `INT` (in minutes)

### Dates
- All timestamps: `DATETIME`
- Default: `CURRENT_TIMESTAMP`
- Auto-update: `ON UPDATE CURRENT_TIMESTAMP` where appropriate

### Enums
- `courses.level`: 'beginner', 'intermediate', 'advanced'
- `lessons.lesson_type`: 'text', 'video', 'interactive'
- `lesson_contents.content_type`: 'text', 'video', 'image'
- `quiz_questions.question_type`: 'single', 'multiple'
- `users.role`: 'student', 'instructor', 'admin'

### Booleans
- `BOOLEAN` (stored as TINYINT(1) in MySQL)
- Common fields: `is_correct`, `is_completed`, `passed`, `is_active`

## Character Set
- Database: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`
- Supports full Unicode including emojis and special characters

## Storage Engine
- All tables use `InnoDB` for:
  - Foreign key support
  - ACID compliance
  - Row-level locking
  - Crash recovery

## Best Practices

### Query Optimization
1. Always use indexed columns in WHERE clauses
2. Use the views for complex aggregations
3. Leverage composite indexes for multi-column filters
4. Consider query result caching in the application layer

### Data Integrity
1. Never bypass foreign key constraints
2. Use transactions for multi-table operations
3. Validate data in application layer before database insert
4. Use appropriate indexes to maintain uniqueness

### Maintenance
1. Regularly analyze table statistics
2. Monitor query performance
3. Consider archiving old user_quiz_attempts
4. Backup database regularly

## Future Enhancements

Potential schema extensions:
1. **Certificates**: Track issued completion certificates
2. **Badges**: Gamification system
3. **Discussions**: Forum/comment system per lesson
4. **File Uploads**: Student submissions
5. **Analytics**: Detailed learning analytics tables
6. **Notifications**: User notification preferences and queue
7. **Audit Log**: Track all data modifications
