/**
 * Course interface - Represents a course in the platform
 * Maps to: courses table in database
 */
export interface Course {
  id: string; // INT [PK]
  title: string; // VARCHAR(255) NOT NULL
  description: string; // TEXT NOT NULL
  thumbnailUrl?: string; // VARCHAR(500)
  level: 'beginner' | 'intermediate' | 'advanced'; // ENUM('beginner', 'intermediate', 'advanced')
  durationMinutes: number; // INT NOT NULL DEFAULT 0
  lessonsCount: number; // INT NOT NULL DEFAULT 0
  createdAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
  updatedAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
}

/**
 * Lesson interface - Represents a lesson within a course
 * Maps to: lessons table in database
 */
export interface Lesson {
  id: string; // INT [PK]
  courseId: string; // INT [FK → courses.id] NOT NULL
  title: string; // VARCHAR(255) NOT NULL
  description?: string; // TEXT
  contentMdPath?: string; // VARCHAR(500) - path to markdown content (legacy, use lesson_contents for new content)
  durationMinutes: number; // INT NOT NULL DEFAULT 0
  orderIndex: number; // INT NOT NULL - display order
  type: 'text' | 'video' | 'interactive'; // ENUM('text', 'video', 'interactive')
  createdAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
  updatedAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
}

/**
 * LessonContent interface - Represents content items within a lesson
 * Maps to: lesson_contents table in database
 * Allows multiple content items (text, video, image) per lesson
 */
export interface LessonContent {
  id: string; // INT [PK]
  lessonId: string; // INT [FK → lessons.id] NOT NULL
  contentType: 'text' | 'video' | 'image'; // ENUM('text', 'video', 'image')
  contentValue: string; // TEXT NOT NULL - text content, file path, or URL
  orderIndex: number; // INT NOT NULL - display order
  createdAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
}

/**
 * Quiz interface - Represents a quiz associated with a lesson
 * Maps to: quizzes table in database
 */
export interface Quiz {
  id: string; // INT [PK]
  lessonId: string; // INT [FK → lessons.id] UNIQUE NOT NULL
  title: string; // VARCHAR(255) NOT NULL
  passingScore: number; // INT NOT NULL DEFAULT 70 (percentage)
  questionsCount: number; // INT NOT NULL DEFAULT 0
  timeLimitMinutes?: number; // INT NULL - optional time limit
  createdAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
}

/**
 * Question interface - Represents a question within a quiz
 * Maps to: quiz_questions table in database
 */
export interface Question {
  id: string; // INT [PK]
  quizId: string; // INT [FK → quizzes.id] NOT NULL
  questionText: string; // TEXT NOT NULL
  type: 'single' | 'multiple' | 'qcm' | 'vrai_faux' | 'qcm_multiple'; // ENUM - supports legacy types for backward compatibility
  explanation?: string; // TEXT - shown after answering
  orderIndex: number; // INT NOT NULL - display order
  points: number; // INT NOT NULL DEFAULT 1
  createdAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
}

/**
 * QuizOption interface - Represents an answer option for a question
 * Maps to: quiz_options table in database
 */
export interface QuizOption {
  id: string; // INT [PK]
  questionId: string; // INT [FK → quiz_questions.id] NOT NULL
  optionText: string; // TEXT NOT NULL
  isCorrect: boolean; // BOOLEAN NOT NULL DEFAULT FALSE
  orderIndex: number; // INT NOT NULL - display order
  createdAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
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
