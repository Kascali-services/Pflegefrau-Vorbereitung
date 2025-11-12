-- ============================================================================
-- Database Schema for Pflegefachfrau Vorbereitung Platform
-- ============================================================================
-- This schema defines the complete database structure for the learning
-- management system, including courses, lessons, quizzes, and user progress.
--
-- Database Engine: MySQL 8.0+ / MariaDB 10.5+
-- Character Set: utf8mb4 (full Unicode support including emojis)
-- Collation: utf8mb4_unicode_ci
-- ============================================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS pflegefrau_vorbereitung
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE pflegefrau_vorbereitung;

-- ============================================================================
-- TABLE: courses
-- Description: Main course/module information
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url VARCHAR(500) DEFAULT NULL,
    level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    duration_minutes INT NOT NULL DEFAULT 0,
    lessons_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_level (level),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Courses (Modules) - Main educational units';

-- ============================================================================
-- TABLE: lessons
-- Description: Individual lessons within a course
-- ============================================================================
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    duration_minutes INT NOT NULL DEFAULT 0,
    order_index INT NOT NULL,
    lesson_type ENUM('text', 'video', 'interactive') NOT NULL DEFAULT 'text',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_order_index (order_index),
    UNIQUE KEY unique_course_order (course_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lessons within courses - ordered educational content units';

-- ============================================================================
-- TABLE: lesson_contents
-- Description: Content items within a lesson (supports multiple content types)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lesson_contents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    content_type ENUM('text', 'video', 'image') NOT NULL,
    content_value TEXT NOT NULL COMMENT 'Text content, file path, or URL',
    order_index INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_order_index (order_index),
    UNIQUE KEY unique_lesson_content_order (lesson_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Content items within lessons - supports multiple media types per lesson';

-- ============================================================================
-- TABLE: quizzes
-- Description: Quizzes associated with lessons
-- ============================================================================
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    passing_score INT NOT NULL DEFAULT 70 COMMENT 'Percentage required to pass (0-100)',
    questions_count INT NOT NULL DEFAULT 0,
    time_limit_minutes INT DEFAULT NULL COMMENT 'Optional time limit in minutes',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_lesson_quiz (lesson_id),
    INDEX idx_lesson_id (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Quizzes for lessons - one quiz per lesson';

-- ============================================================================
-- TABLE: quiz_questions
-- Description: Questions within a quiz
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('single', 'multiple') NOT NULL COMMENT 'single=single choice, multiple=multiple choice',
    explanation TEXT DEFAULT NULL COMMENT 'Explanation shown after answering',
    order_index INT NOT NULL,
    points INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_order_index (order_index),
    UNIQUE KEY unique_quiz_question_order (quiz_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Questions in quizzes - supports single and multiple choice';

-- ============================================================================
-- TABLE: quiz_options
-- Description: Answer options for quiz questions
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_question_id (question_id),
    INDEX idx_is_correct (is_correct),
    INDEX idx_order_index (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Answer options for quiz questions';

-- ============================================================================
-- TABLE: users (if not already exists)
-- Description: Platform users
-- Note: This may already exist in your authentication system
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) DEFAULT NULL,
    last_name VARCHAR(100) DEFAULT NULL,
    role ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at DATETIME DEFAULT NULL,
    
    UNIQUE KEY unique_email (email),
    UNIQUE KEY unique_username (username),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Platform users - students, instructors, and administrators';

-- ============================================================================
-- TABLE: user_course_enrollments
-- Description: Track which users are enrolled in which courses
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_course_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at DATETIME DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_user_course (user_id, course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_enrolled_at (enrolled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User enrollments in courses';

-- ============================================================================
-- TABLE: user_lesson_progress
-- Description: Track user progress through lessons
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    best_score INT DEFAULT 0 COMMENT 'Best quiz score percentage (0-100)',
    attempt_count INT NOT NULL DEFAULT 0,
    time_spent_minutes INT NOT NULL DEFAULT 0,
    last_attempt_at DATETIME DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    INDEX idx_user_id (user_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_is_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User progress tracking for individual lessons';

-- ============================================================================
-- TABLE: user_quiz_attempts
-- Description: Individual quiz attempts by users
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    lesson_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Score percentage (0.00-100.00)',
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_number INT NOT NULL DEFAULT 1,
    time_taken_minutes INT DEFAULT NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME DEFAULT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_passed (passed),
    INDEX idx_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Quiz attempts - tracks each time a user takes a quiz';

-- ============================================================================
-- TABLE: user_answers
-- Description: Individual answers given by users in quiz attempts
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    option_id INT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (attempt_id) REFERENCES user_quiz_attempts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (option_id) REFERENCES quiz_options(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_attempt_id (attempt_id),
    INDEX idx_question_id (question_id),
    INDEX idx_option_id (option_id),
    INDEX idx_is_correct (is_correct)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User answers in quiz attempts - stores selected options';

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Course progress summary for users
CREATE OR REPLACE VIEW view_user_course_progress AS
SELECT 
    e.user_id,
    e.course_id,
    c.title AS course_title,
    COUNT(DISTINCT l.id) AS total_lessons,
    COUNT(DISTINCT CASE WHEN ulp.is_completed = TRUE THEN l.id END) AS completed_lessons,
    ROUND(
        (COUNT(DISTINCT CASE WHEN ulp.is_completed = TRUE THEN l.id END) * 100.0) / 
        NULLIF(COUNT(DISTINCT l.id), 0),
        2
    ) AS progress_percentage,
    MAX(ulp.updated_at) AS last_activity_at
FROM user_course_enrollments e
INNER JOIN courses c ON e.course_id = c.id
INNER JOIN lessons l ON c.id = l.course_id
LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND e.user_id = ulp.user_id
GROUP BY e.user_id, e.course_id, c.title;

-- View: Quiz performance summary
CREATE OR REPLACE VIEW view_user_quiz_performance AS
SELECT 
    uqa.user_id,
    uqa.quiz_id,
    q.lesson_id,
    q.title AS quiz_title,
    COUNT(uqa.id) AS total_attempts,
    MAX(uqa.score) AS best_score,
    AVG(uqa.score) AS average_score,
    SUM(CASE WHEN uqa.passed = TRUE THEN 1 ELSE 0 END) AS passed_attempts,
    MAX(uqa.finished_at) AS last_attempt_at
FROM user_quiz_attempts uqa
INNER JOIN quizzes q ON uqa.quiz_id = q.id
WHERE uqa.finished_at IS NOT NULL
GROUP BY uqa.user_id, uqa.quiz_id, q.lesson_id, q.title;

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Additional composite indexes for common query patterns
CREATE INDEX idx_user_lesson_progress_composite ON user_lesson_progress(user_id, lesson_id, is_completed);
CREATE INDEX idx_quiz_attempts_user_quiz ON user_quiz_attempts(user_id, quiz_id, started_at);

-- ============================================================================
-- TRIGGERS FOR DATA INTEGRITY
-- ============================================================================

-- Trigger: Update lessons_count when lessons are added/removed
DELIMITER //

CREATE TRIGGER trg_after_lesson_insert
AFTER INSERT ON lessons
FOR EACH ROW
BEGIN
    UPDATE courses 
    SET lessons_count = lessons_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.course_id;
END//

CREATE TRIGGER trg_after_lesson_delete
AFTER DELETE ON lessons
FOR EACH ROW
BEGIN
    UPDATE courses 
    SET lessons_count = GREATEST(0, lessons_count - 1),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.course_id;
END//

-- Trigger: Update questions_count when questions are added/removed
CREATE TRIGGER trg_after_question_insert
AFTER INSERT ON quiz_questions
FOR EACH ROW
BEGIN
    UPDATE quizzes 
    SET questions_count = questions_count + 1
    WHERE id = NEW.quiz_id;
END//

CREATE TRIGGER trg_after_question_delete
AFTER DELETE ON quiz_questions
FOR EACH ROW
BEGIN
    UPDATE quizzes 
    SET questions_count = GREATEST(0, questions_count - 1)
    WHERE id = OLD.quiz_id;
END//

-- Trigger: Update course duration when lesson duration changes
CREATE TRIGGER trg_after_lesson_duration_update
AFTER UPDATE ON lessons
FOR EACH ROW
BEGIN
    IF NEW.duration_minutes != OLD.duration_minutes THEN
        UPDATE courses 
        SET duration_minutes = (
            SELECT COALESCE(SUM(duration_minutes), 0)
            FROM lessons
            WHERE course_id = NEW.course_id
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.course_id;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample course
INSERT INTO courses (id, title, description, level, duration_minutes, lessons_count)
VALUES (1, 'Grundlagen der Pflege', 'Einführung in die grundlegenden Konzepte und Praktiken der professionellen Pflege', 'beginner', 0, 0);

-- Insert sample lesson
INSERT INTO lessons (id, course_id, title, description, duration_minutes, order_index, lesson_type)
VALUES (1, 1, 'Einführung in die Pflege', 'Überblick über den Pflegeberuf und seine Bedeutung', 30, 1, 'text');

-- Insert sample lesson content
INSERT INTO lesson_contents (lesson_id, content_type, content_value, order_index)
VALUES 
    (1, 'text', '# Willkommen zur Pflegeausbildung\n\nIn dieser Lektion lernen Sie die Grundlagen...', 1),
    (1, 'video', '/assets/videos/intro-to-nursing.mp4', 2),
    (1, 'image', '/assets/images/nursing-overview.jpg', 3);

-- Insert sample quiz
INSERT INTO quizzes (id, lesson_id, title, passing_score, questions_count)
VALUES (1, 1, 'Grundlagen-Quiz', 70, 0);

-- Insert sample question
INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, explanation, order_index, points)
VALUES (1, 1, 'Was ist das Hauptziel der professionellen Pflege?', 'single', 
        'Die professionelle Pflege zielt darauf ab, die Gesundheit und das Wohlbefinden der Patienten zu fördern und zu erhalten.',
        1, 1);

-- Insert sample options
INSERT INTO quiz_options (question_id, option_text, is_correct, order_index)
VALUES 
    (1, 'Nur medizinische Behandlungen durchführen', FALSE, 1),
    (1, 'Gesundheit und Wohlbefinden der Patienten fördern', TRUE, 2),
    (1, 'Ausschließlich administrative Aufgaben erledigen', FALSE, 3),
    (1, 'Nur Medikamente verabreichen', FALSE, 4);

-- ============================================================================
-- USEFUL QUERIES FOR APPLICATION
-- ============================================================================

-- Get all courses with progress for a specific user
-- SELECT c.*, vcp.progress_percentage, vcp.completed_lessons, vcp.total_lessons
-- FROM courses c
-- LEFT JOIN view_user_course_progress vcp ON c.id = vcp.course_id AND vcp.user_id = ?
-- ORDER BY c.created_at DESC;

-- Get lessons for a course with user progress
-- SELECT l.*, ulp.is_completed, ulp.best_score
-- FROM lessons l
-- LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = ?
-- WHERE l.course_id = ?
-- ORDER BY l.order_index;

-- Get quiz with all questions and options
-- SELECT q.*, qq.*, qo.*
-- FROM quizzes q
-- INNER JOIN quiz_questions qq ON q.id = qq.quiz_id
-- INNER JOIN quiz_options qo ON qq.id = qo.question_id
-- WHERE q.id = ?
-- ORDER BY qq.order_index, qo.order_index;

-- Get user's quiz attempts with details
-- SELECT uqa.*, q.title, l.title AS lesson_title
-- FROM user_quiz_attempts uqa
-- INNER JOIN quizzes q ON uqa.quiz_id = q.id
-- INNER JOIN lessons l ON q.lesson_id = l.id
-- WHERE uqa.user_id = ?
-- ORDER BY uqa.started_at DESC;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
