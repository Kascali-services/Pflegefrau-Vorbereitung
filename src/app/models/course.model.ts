/**
 * Course interface - Represents a course in the platform
 * Maps to: Course table in database
 */
export interface Course {
  id: string; // VARCHAR(50) [PK]
  title: string; // VARCHAR(255) NOT NULL
  description: string; // TEXT NOT NULL
  thumbnailUrl?: string; // VARCHAR(500)
  level: 'beginner' | 'intermediate' | 'advanced'; // ENUM
  durationMinutes: number; // INTEGER NOT NULL DEFAULT 0
  lessonsCount: number; // INTEGER NOT NULL DEFAULT 0
  createdAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/**
 * Lesson interface - Represents a lesson within a course
 * Maps to: Lesson table in database
 */
export interface Lesson {
  id: string; // VARCHAR(50) [PK]
  courseId: string; // VARCHAR(50) [FK → Course.id] NOT NULL
  title: string; // VARCHAR(255) NOT NULL
  description?: string; // TEXT
  contentMdPath: string; // VARCHAR(500) NOT NULL - path to markdown content
  durationMinutes: number; // INTEGER NOT NULL DEFAULT 0
  orderIndex: number; // INTEGER NOT NULL - display order
  type: 'text' | 'video' | 'interactive'; // ENUM
  createdAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/**
 * Quiz interface - Represents a quiz associated with a lesson
 * Maps to: Quiz table in database
 */
export interface Quiz {
  id: string; // VARCHAR(50) [PK]
  lessonId: string; // VARCHAR(50) [FK → Lesson.id] UNIQUE NOT NULL
  title: string; // VARCHAR(255) NOT NULL
  passingScore: number; // INTEGER NOT NULL DEFAULT 70 (percentage)
  questionsCount: number; // INTEGER NOT NULL DEFAULT 0
  timeLimitMinutes?: number; // INTEGER NULL - optional time limit
  createdAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/**
 * Question interface - Represents a question within a quiz
 * Maps to: Question table in database
 */
export interface Question {
  id: string; // VARCHAR(50) [PK]
  quizId: string; // VARCHAR(50) [FK → Quiz.id] NOT NULL
  questionText: string; // TEXT NOT NULL
  type: 'qcm' | 'vrai_faux' | 'qcm_multiple'; // ENUM (single choice, true/false, multiple choice)
  explanation: string; // TEXT NOT NULL - shown after answering
  orderIndex: number; // INTEGER NOT NULL - display order
  points: number; // INTEGER NOT NULL DEFAULT 1
  createdAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/**
 * QuizOption interface - Represents an answer option for a question
 * Maps to: QuizOption table in database
 */
export interface QuizOption {
  id: string; // VARCHAR(50) [PK]
  questionId: string; // VARCHAR(50) [FK → Question.id] NOT NULL
  optionText: string; // TEXT NOT NULL
  isCorrect: boolean; // BOOLEAN NOT NULL DEFAULT FALSE
  orderIndex: number; // INTEGER NOT NULL - display order
  createdAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// Legacy support - keeping old interfaces for backward compatibility during migration
/**
 * @deprecated Use Course instead
 */
export type Module = Course;

/**
 * @deprecated Chapters are removed - use lessons directly under courses
 */
export interface Chapter {
  id: string;
  moduleId: string;
  title: string;
  lessons: Lesson[];
  estimatedTime: number;
  order: number;
}
