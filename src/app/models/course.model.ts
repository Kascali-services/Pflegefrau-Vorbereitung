/**
 * Module interface - Represents a learning module in the platform
 */
export interface Module {
  id: string; // 'module-1'
  title: string; // 'Vocabulaire anatomique'
  description: string; // Short description
  level: 'beginner' | 'intermediate' | 'advanced';
  icon: string; // Material icon name
  chapters: Chapter[];
  createdAt?: Date;
}

/**
 * Chapter interface - Represents a chapter within a module
 */
export interface Chapter {
  id: string; // 'chapter-1'
  moduleId: string; // Reference to parent
  title: string;
  lessons: Lesson[];
  estimatedTime: number; // Minutes to complete
  order: number; // Display order
}

/**
 * Lesson interface - Represents a lesson within a chapter
 */
export interface Lesson {
  id: string; // 'lesson-1'
  chapterId: string;
  title: string;
  content: string; // Markdown format
  type: 'text' | 'video' | 'interactive';
  quizId?: string; // Optional quiz
  duration: number; // Reading time in minutes
  order: number;
}

/**
 * Quiz interface - Represents a quiz associated with a lesson
 */
export interface Quiz {
  id: string; // 'quiz-1'
  lessonId: string;
  title: string;
  questions: Question[];
  passingScore: number; // Percentage (e.g., 70)
  timeLimit?: number; // Optional time limit in minutes
}

/**
 * Question interface - Represents a question within a quiz
 */
export interface Question {
  id: string;
  quizId: string;
  question: string;
  answers: string[]; // Array of possible answers
  correctAnswer: number; // Index of correct answer (0-based)
  explanation: string; // Shown after answering
  type: 'single' | 'multiple' | 'truefalse';
}
