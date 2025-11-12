/**
 * UserProgress interface - Tracks user progress for a specific lesson
 * Maps to: user_lesson_progress table in database
 */
export interface UserProgress {
  id: string; // INT [PK]
  userId: string | null; // INT [FK → users.id] NULL
  lessonId: string; // INT [FK → lessons.id] NOT NULL
  isCompleted: boolean; // BOOLEAN NOT NULL DEFAULT FALSE
  bestScore: number; // INT DEFAULT 0 (0-100)
  attemptCount: number; // INT NOT NULL DEFAULT 0
  timeSpentMinutes: number; // INT NOT NULL DEFAULT 0
  lastAttemptAt?: Date; // DATETIME
  completedAt?: Date; // DATETIME - filled on first success
  createdAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
  updatedAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
}

/**
 * UserQuizAttempt interface - Tracks individual quiz attempts
 * Maps to: user_quiz_attempts table in database
 */
export interface UserQuizAttempt {
  id: string; // INT [PK]
  userId: string | null; // INT [FK → users.id] NULL
  quizId: string; // INT [FK → quizzes.id] NOT NULL
  lessonId: string; // INT [FK → lessons.id] NOT NULL
  score: number; // DECIMAL(5,2) NOT NULL (0.00-100.00)
  passed: boolean; // BOOLEAN NOT NULL DEFAULT FALSE
  attemptNumber: number; // INT NOT NULL DEFAULT 1
  timeTakenMinutes?: number; // INT
  answers: QuizAnswer[]; // JSONB NOT NULL - stored as JSON in DB (or use user_answers table)
  startedAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
  completedAt?: Date; // DATETIME
}

/**
 * QuizAnswer interface - Structure for individual answer in a quiz attempt
 * Part of JSONB answers field in UserQuizAttempt (for in-memory use)
 * For database storage, use UserAnswer table instead
 */
export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[]; // Array of option IDs
  isCorrect: boolean;
}

/**
 * UserAnswer interface - Individual answers given by users in quiz attempts
 * Maps to: user_answers table in database
 * This provides normalized storage alternative to JSONB answers in UserQuizAttempt
 */
export interface UserAnswer {
  id: string; // INT [PK]
  attemptId: string; // INT [FK → user_quiz_attempts.id] NOT NULL
  questionId: string; // INT [FK → quiz_questions.id] NOT NULL
  optionId: string; // INT [FK → quiz_options.id] NOT NULL
  isCorrect: boolean; // BOOLEAN NOT NULL DEFAULT FALSE
  answeredAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
}

/**
 * CourseProgress interface - Calculated progress for a course
 * Not a DB table - computed from UserProgress records
 */
export interface CourseProgress {
  courseId: string;
  progress: number; // Percentage (0-100)
  completedLessons: number;
  totalLessons: number;
  lastAccessedLessonId?: string;
}

// Legacy support - keeping old interfaces for backward compatibility
/**
 * @deprecated Use UserProgress and UserQuizAttempt instead
 */
export interface QuizScore {
  quizId: string;
  score: number;
  attempts: number;
  lastAttempt: Date;
  passed: boolean;
}

/**
 * @deprecated Use CourseProgress instead
 */
export interface ModuleProgress {
  moduleId: string;
  progress: number;
  completedChapters: number;
}
