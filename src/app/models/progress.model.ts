/**
 * UserProgress interface - Tracks user progress across all modules
 */
export interface UserProgress {
  userId?: string; // For future auth
  completedLessons: string[]; // Array of lesson IDs
  quizScores: QuizScore[];
  lastAccessedLesson?: string;
  totalProgress: number; // Percentage
  moduleProgress: ModuleProgress[];
}

/**
 * QuizScore interface - Tracks individual quiz results
 */
export interface QuizScore {
  quizId: string;
  score: number; // Percentage
  attempts: number;
  lastAttempt: Date;
  passed: boolean;
}

/**
 * ModuleProgress interface - Tracks progress within a specific module
 */
export interface ModuleProgress {
  moduleId: string;
  progress: number; // Percentage
  completedChapters: number;
}
