# Database Schema Visual Summary

## Table Structure Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONTENT HIERARCHY                             │
└─────────────────────────────────────────────────────────────────────┘

courses (Main educational units)
  ├── id (PK)
  ├── title
  ├── description
  ├── thumbnail_url
  ├── level (beginner/intermediate/advanced)
  ├── duration_minutes
  ├── lessons_count
  └── timestamps
      │
      └─[1:N]─→ lessons (Individual lessons)
                  ├── id (PK)
                  ├── course_id (FK)
                  ├── title
                  ├── description
                  ├── duration_minutes
                  ├── order_index
                  ├── lesson_type (text/video/interactive)
                  └── timestamps
                      │
                      ├─[1:N]─→ lesson_contents (Content items)
                      │           ├── id (PK)
                      │           ├── lesson_id (FK)
                      │           ├── content_type (text/video/image)
                      │           ├── content_value
                      │           └── order_index
                      │
                      └─[1:0..1]→ quizzes (Optional quiz)
                                    ├── id (PK)
                                    ├── lesson_id (FK, UNIQUE)
                                    ├── title
                                    ├── passing_score
                                    ├── questions_count
                                    └── time_limit_minutes
                                        │
                                        └─[1:N]─→ quiz_questions
                                                    ├── id (PK)
                                                    ├── quiz_id (FK)
                                                    ├── question_text
                                                    ├── question_type
                                                    ├── explanation
                                                    ├── order_index
                                                    └── points
                                                        │
                                                        └─[1:N]─→ quiz_options
                                                                    ├── id (PK)
                                                                    ├── question_id (FK)
                                                                    ├── option_text
                                                                    ├── is_correct
                                                                    └── order_index
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER & PROGRESS TRACKING                         │
└─────────────────────────────────────────────────────────────────────┘

users (Platform users)
  ├── id (PK)
  ├── email (UNIQUE)
  ├── username (UNIQUE)
  ├── password_hash
  ├── first_name
  ├── last_name
  ├── role (student/instructor/admin)
  ├── is_active
  └── timestamps
      │
      ├─[1:N]─→ user_course_enrollments (Course enrollment)
      │           ├── id (PK)
      │           ├── user_id (FK)
      │           ├── course_id (FK)
      │           ├── enrolled_at
      │           ├── last_accessed_at
      │           └── completed_at
      │
      ├─[1:N]─→ user_lesson_progress (Lesson progress)
      │           ├── id (PK)
      │           ├── user_id (FK)
      │           ├── lesson_id (FK)
      │           ├── is_completed
      │           ├── best_score
      │           ├── attempt_count
      │           ├── time_spent_minutes
      │           ├── last_attempt_at
      │           ├── completed_at
      │           └── timestamps
      │
      └─[1:N]─→ user_quiz_attempts (Quiz attempts)
                  ├── id (PK)
                  ├── user_id (FK)
                  ├── quiz_id (FK)
                  ├── lesson_id (FK)
                  ├── score
                  ├── passed
                  ├── attempt_number
                  ├── time_taken_minutes
                  ├── started_at
                  └── finished_at
                      │
                      └─[1:N]─→ user_answers (Individual answers)
                                  ├── id (PK)
                                  ├── attempt_id (FK)
                                  ├── question_id (FK)
                                  ├── option_id (FK)
                                  ├── is_correct
                                  └── answered_at
```

## Key Relationships

### Many-to-Many Relationships
- **users ↔ courses** (via user_course_enrollments)
- **users ↔ lessons** (via user_lesson_progress)

### One-to-Many Relationships
- courses → lessons
- lessons → lesson_contents
- lessons → quizzes (0..1)
- quizzes → quiz_questions
- quiz_questions → quiz_options
- users → user_quiz_attempts
- user_quiz_attempts → user_answers

## Data Flow Examples

### Student Taking a Course

```
1. User enrolls in course
   INSERT INTO user_course_enrollments (user_id, course_id, enrolled_at)

2. User accesses first lesson
   INSERT INTO user_lesson_progress (user_id, lesson_id, ...)

3. User views lesson contents (in order)
   SELECT * FROM lesson_contents WHERE lesson_id = ? ORDER BY order_index

4. User takes quiz
   INSERT INTO user_quiz_attempts (user_id, quiz_id, lesson_id, started_at)

5. User answers questions
   INSERT INTO user_answers (attempt_id, question_id, option_id, is_correct)

6. Quiz completed
   UPDATE user_quiz_attempts SET finished_at = NOW(), score = ?, passed = ?
   UPDATE user_lesson_progress SET is_completed = TRUE, best_score = ?

7. Course progress calculated
   SELECT FROM view_user_course_progress WHERE user_id = ? AND course_id = ?
```

### Content Creation Flow

```
1. Create course
   INSERT INTO courses (title, description, level)

2. Add lessons (in order)
   INSERT INTO lessons (course_id, title, order_index)
   → Trigger updates courses.lessons_count

3. Add content to lesson
   INSERT INTO lesson_contents (lesson_id, content_type, content_value, order_index)

4. Create quiz (optional)
   INSERT INTO quizzes (lesson_id, title, passing_score)

5. Add questions
   INSERT INTO quiz_questions (quiz_id, question_text, question_type, order_index)
   → Trigger updates quizzes.questions_count

6. Add answer options
   INSERT INTO quiz_options (question_id, option_text, is_correct, order_index)
```

## Index Strategy

### Primary Indexes (PK)
- All tables have auto-increment INT primary key

### Foreign Key Indexes
- Automatically created for all FK columns
- Enable efficient JOIN operations

### Performance Indexes
```
courses:
  - idx_level (for filtering by difficulty)
  - idx_created_at (for sorting)

lessons:
  - idx_course_id (for course lessons query)
  - idx_order_index (for ordering)
  - unique_course_order (course_id, order_index)

lesson_contents:
  - idx_lesson_id (for lesson contents query)
  - idx_order_index (for ordering)
  - unique_lesson_content_order (lesson_id, order_index)

quiz_questions:
  - idx_quiz_id (for quiz questions query)
  - idx_order_index (for ordering)
  - unique_quiz_question_order (quiz_id, order_index)

user_lesson_progress:
  - idx_user_id, idx_lesson_id (for user progress queries)
  - idx_is_completed (for filtering completed lessons)
  - idx_user_lesson_progress_composite (user_id, lesson_id, is_completed)

user_quiz_attempts:
  - idx_user_id, idx_quiz_id (for user attempts queries)
  - idx_passed (for analytics)
  - idx_quiz_attempts_user_quiz (user_id, quiz_id, started_at)
```

## Views for Common Queries

### view_user_course_progress
Aggregates progress across all enrolled courses:
- Total lessons vs completed lessons
- Progress percentage
- Last activity timestamp

**Query Example:**
```sql
SELECT * FROM view_user_course_progress 
WHERE user_id = 1 
ORDER BY last_activity_at DESC;
```

### view_user_quiz_performance
Summarizes quiz performance metrics:
- Total attempts per quiz
- Best, average, and latest scores
- Pass rate statistics

**Query Example:**
```sql
SELECT * FROM view_user_quiz_performance 
WHERE user_id = 1 AND passed_attempts > 0;
```

## Triggers

### Automatic Counters
- `trg_after_lesson_insert` → increments courses.lessons_count
- `trg_after_lesson_delete` → decrements courses.lessons_count
- `trg_after_question_insert` → increments quizzes.questions_count
- `trg_after_question_delete` → decrements quizzes.questions_count

### Aggregations
- `trg_after_lesson_duration_update` → recalculates courses.duration_minutes

## Data Integrity Rules

### Cascading Deletes
- Delete course → deletes all lessons, lesson_contents, quizzes, etc.
- Delete lesson → deletes lesson_contents, quiz, user_progress
- Delete quiz → deletes quiz_questions, quiz_options, user_attempts
- Delete user → deletes all enrollments, progress, attempts

### Unique Constraints
- One quiz per lesson (quizzes.lesson_id UNIQUE)
- One enrollment per user-course (user_id, course_id UNIQUE)
- One progress record per user-lesson (user_id, lesson_id UNIQUE)
- Ordered content within lesson (lesson_id, order_index UNIQUE)

### Referential Integrity
All foreign keys enforce referential integrity:
- Cannot add lesson without valid course
- Cannot add quiz without valid lesson
- Cannot add user_progress without valid user and lesson
- etc.

## Performance Considerations

### Query Optimization Tips
1. Always filter by indexed columns (course_id, user_id, etc.)
2. Use the views for complex aggregations
3. Leverage composite indexes for multi-column filters
4. Consider pagination for large result sets

### Scaling Strategies
1. **Read Replicas**: For read-heavy workloads
2. **Caching**: Redis for frequently accessed data
3. **Partitioning**: Partition user_quiz_attempts by date
4. **Archiving**: Archive old attempts to separate table

### Maintenance
1. Regular ANALYZE TABLE to update statistics
2. Monitor slow query log
3. Review and optimize indexes periodically
4. Consider archiving old data

## Security Best Practices

1. **Never store plain text passwords** - use bcrypt/argon2
2. **Use parameterized queries** - prevent SQL injection
3. **Enable SSL/TLS** for database connections
4. **Restrict database user permissions** - principle of least privilege
5. **Regular backups** - automated daily backups
6. **Audit logging** - track sensitive data changes
7. **Input validation** - validate at application layer before DB

## Migration Checklist

- [ ] Create database using schema.sql
- [ ] Verify all tables created successfully
- [ ] Test foreign key constraints
- [ ] Verify triggers are working
- [ ] Load sample data for testing
- [ ] Create database users with appropriate permissions
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Implement backend API endpoints
- [ ] Update frontend services to use API
- [ ] Test end-to-end functionality
- [ ] Monitor performance and optimize queries
- [ ] Set up production database (RDS, Cloud SQL, etc.)
- [ ] Configure SSL/TLS for production
- [ ] Set up monitoring and alerting

## Quick Reference

### Connection String Format
```
mysql+pymysql://username:password@host:port/pflegefrau_vorbereitung
```

### Common Queries

**Get course with lessons:**
```sql
SELECT c.*, l.* 
FROM courses c 
LEFT JOIN lessons l ON c.id = l.course_id 
WHERE c.id = ? 
ORDER BY l.order_index;
```

**Get user's course progress:**
```sql
SELECT * FROM view_user_course_progress 
WHERE user_id = ? AND course_id = ?;
```

**Get quiz with questions and options:**
```sql
SELECT q.*, qq.*, qo.* 
FROM quizzes q
INNER JOIN quiz_questions qq ON q.id = qq.quiz_id
INNER JOIN quiz_options qo ON qq.id = qo.question_id
WHERE q.id = ?
ORDER BY qq.order_index, qo.order_index;
```

**Get user's quiz history:**
```sql
SELECT uqa.*, q.title AS quiz_title, l.title AS lesson_title
FROM user_quiz_attempts uqa
INNER JOIN quizzes q ON uqa.quiz_id = q.id
INNER JOIN lessons l ON q.lesson_id = l.id
WHERE uqa.user_id = ?
ORDER BY uqa.started_at DESC;
```
