/**
 * TypeScript interfaces for Learning Service API
 * Maps to backend endpoints as specified in the learning service documentation
 */

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// COURSE ENDPOINTS
// ============================================================================

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  lessonsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesListResponse {
  courses: CourseResponse[];
  pagination: PaginationResponse;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  thumbnailUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes?: number;
}

// ============================================================================
// LESSON ENDPOINTS
// ============================================================================

export interface LessonResponse {
  id: string;
  courseId: string;
  course_id?: string; // Backend inconsistency: some endpoints may return snake_case
  title: string;
  description?: string;
  duration_minutes: number;
  orderIndex: number;
  createdAt: string;
}

export interface LessonsListResponse {
  lessons: LessonResponse[];
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  duration_minutes: number;
  order_index: number;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  durationMinutes?: number;
  orderIndex?: number;
}

// ============================================================================
// LESSON CONTENT ENDPOINTS
// ============================================================================

export interface LessonContentResponse {
  id: string;
  lessonId: string;
  contentType: 'text' | 'video' | 'image';
  contentValue: string;
  orderIndex: number;
  createdAt: string;
}

export interface LessonContentsListResponse {
  contents: LessonContentResponse[];
}

export interface CreateLessonContentRequest {
  contentType: 'text' | 'video' | 'image';
  contentValue: string;
  orderIndex: number;
}

export interface UpdateLessonContentRequest {
  contentValue?: string;
  orderIndex?: number;
}

// ============================================================================
// QUIZ ENDPOINTS
// ============================================================================

export interface QuizResponse {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questionsCount: number;
  timeLimitMinutes?: number;
  createdAt: string;
}

export interface CreateQuizRequest {
  lessonId: string;
  title: string;
  passingScore: number;
  timeLimitMinutes?: number;
}

export interface QuestionResponse {
  id: string;
  quizId: string;
  questionText: string;
  type: 'qcm' | 'vrai_faux' | 'qcm_multiple';
  explanation: string;
  orderIndex: number;
  points: number;
  options: QuizOptionResponse[];
}

export interface QuestionsListResponse {
  questions: QuestionResponse[];
}

export interface CreateQuestionRequest {
  questionText: string;
  type: 'qcm' | 'vrai_faux' | 'qcm_multiple';
  explanation: string;
  orderIndex: number;
  points?: number;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  explanation?: string;
  orderIndex?: number;
}

export interface QuizOptionResponse {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface CreateQuizOptionRequest {
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

// ============================================================================
// QUIZ ATTEMPT ENDPOINTS
// ============================================================================

export interface SubmitQuizAttemptRequest {
  lessonId: string;
  answers: {
    questionId: string;
    selectedOptionIds: string[];
  }[];
}

export interface QuizAttemptResponse {
  id: string;
  userId: string;
  quizId: string;
  lessonId: string;
  score: number;
  passed: boolean;
  attemptNumber: number;
  answers: {
    questionId: string;
    selectedOptions: string[];
    isCorrect: boolean;
  }[];
  completedAt: string;
}

export interface QuizAttemptsListResponse {
  attempts: {
    id: string;
    quizId: string;
    score: number;
    passed: boolean;
    attemptNumber: number;
    completedAt: string;
  }[];
}

// ============================================================================
// PROGRESS ENDPOINTS
// ============================================================================

export interface CourseProgressResponse {
  courseId: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedLessonId?: string;
}

export interface LessonProgressResponse {
  id: string;
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  bestScore: number;
  attemptCount: number;
  timeSpentMinutes: number;
  lastAttemptAt?: string;
  completedAt?: string;
}

export interface CompleteLessonResponse {
  id: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt: string;
}

export interface UpdateLessonAccessResponse {
  lessonId: string;
  updatedAt: string;
}

// ============================================================================
// ENROLLMENT ENDPOINTS
// ============================================================================

export interface EnrollmentResponse {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
}

// Actual backend response format
export interface ActualEnrolledCoursesResponse {
  enrollments: {
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string;
    last_accessed_at?: string;
  }[];
}

// Expected format (for backward compatibility)
export interface EnrolledCoursesResponse {
  enrollments: {
    course: CourseResponse;
    enrollment: {
      id: string;
      enrolledAt: string;
      lastAccessedAt?: string;
    };
    progress: {
      progressPercentage: number;
      completedLessons: number;
      totalLessons: number;
    };
  }[];
}
