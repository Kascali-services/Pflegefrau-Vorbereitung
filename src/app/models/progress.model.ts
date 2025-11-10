/**
 * UserProgress interface - Tracks user progress for a specific lesson
 * Maps to: UserProgress table in database
 */
export interface UserProgress {
  id: string; // VARCHAR(50) [PK]
  userId: string | null; // VARCHAR(50) [FK → User.id] NULL
  lessonId: string; // VARCHAR(50) [FK → Lesson.id] NOT NULL
  isCompleted: boolean; // BOOLEAN NOT NULL DEFAULT FALSE
  bestScore: number; // INTEGER DEFAULT 0 (0-100)
  attemptCount: number; // INTEGER NOT NULL DEFAULT 0
  timeSpentMinutes: number; // INTEGER NOT NULL DEFAULT 0
  lastAttemptAt?: Date; // TIMESTAMP
  completedAt?: Date; // TIMESTAMP - filled on first success
  createdAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/**
 * UserQuizAttempt interface - Tracks individual quiz attempts
 * Maps to: UserQuizAttempt table in database
 */
export interface UserQuizAttempt {
  id: string; // VARCHAR(50) [PK]
  userId: string | null; // VARCHAR(50) [FK → User.id] NULL
  quizId: string; // VARCHAR(50) [FK → Quiz.id] NOT NULL
  lessonId: string; // VARCHAR(50) [FK → Lesson.id] NOT NULL
  score: number; // INTEGER NOT NULL (0-100)
  passed: boolean; // BOOLEAN NOT NULL DEFAULT FALSE
  attemptNumber: number; // INTEGER NOT NULL DEFAULT 1
  timeTakenMinutes?: number; // INTEGER
  answers: QuizAnswer[]; // JSONB NOT NULL - stored as JSON in DB
  completedAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/**
 * QuizAnswer interface - Structure for individual answer in a quiz attempt
 * Part of JSONB answers field in UserQuizAttempt
 */
export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[]; // Array of option IDs
  isCorrect: boolean;
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
