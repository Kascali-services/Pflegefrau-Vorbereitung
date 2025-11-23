import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, BehaviorSubject, combineLatest, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import {
  Course,
  Lesson,
  LessonContent,
  Quiz,
  Question,
  QuizOption,
} from '../../models/course.model';
import {
  UserProgress,
  UserQuizAttempt,
  CourseProgress,
} from '../../models/progress.model';
import { UserCourseEnrollment } from '../../models/user.model';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import {
  CoursesListResponse,
  CourseResponse,
  LessonsListResponse,
  LessonResponse,
  LessonContentsListResponse,
  LessonContentResponse,
  QuizResponse,
  QuestionsListResponse,
  QuestionResponse,
  SubmitQuizAttemptRequest,
  QuizAttemptResponse,
  CourseProgressResponse,
  LessonProgressResponse,
  CompleteLessonResponse,
  ActualEnrolledCoursesResponse,
} from '../interfaces/learning-api.interface';

/**
 * CourseService - Manages course data and user progress
 * Integrated with Learning Service backend via API gateway
 */
@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private apiUrl = `${environment.apiUrl}/api`;

  // Cache for courses data
  private coursesCache = new BehaviorSubject<Course[]>([]);
  courses$ = this.coursesCache.asObservable();

  constructor() {
    // Load initial courses
    this.loadCourses();
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Convert API response to Course model
   */
  private convertCourseResponseToCourse(response: CourseResponse): Course {
    return {
      id: response.id,
      title: response.title,
      description: response.description,
      thumbnailUrl: response.thumbnail_url,
      level: response.level,
      durationMinutes: Number(response.duration_minutes),
      lessonsCount: Number(response.lessonsCount),
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    };
  }

  /**
   * Convert API response to Lesson model
   */
  private convertLessonResponseToLesson(response: LessonResponse): Lesson {
    // Handle both camelCase and snake_case for courseId (backend inconsistency)
    const courseId = response.courseId || (response as { course_id?: string }).course_id || '';
    
    if (!this.isValidCourseId(courseId)) {
      console.error('Invalid courseId in lesson response:', response);
    }
    
    return {
      id: response.id,
      courseId: courseId,
      title: response.title,
      description: response.description,
      durationMinutes: response.duration_minutes,
      orderIndex: response.orderIndex,
      createdAt: new Date(response.createdAt),
    };
  }

  /**
   * Convert API response to LessonContent model
   */
  private convertLessonContentResponseToLessonContent(
    response: LessonContentResponse
  ): LessonContent {
    return {
      id: response.id,
      lessonId: response.lessonId,
      contentType: response.contentType,
      contentValue: response.contentValue,
      orderIndex: response.orderIndex,
      createdAt: new Date(response.createdAt),
    };
  }

  /**
   * Convert API response to Quiz model
   */
  private convertQuizResponseToQuiz(response: QuizResponse): Quiz {
    return {
      id: response.id,
      lessonId: response.lessonId,
      title: response.title,
      passingScore: response.passingScore,
      questionsCount: response.questionsCount,
      timeLimitMinutes: response.timeLimitMinutes,
      createdAt: new Date(response.createdAt),
    };
  }

  /**
   * Convert API response to Question model
   */
  private convertQuestionResponseToQuestion(response: QuestionResponse): Question {
    return {
      id: response.id,
      quizId: response.quizId,
      questionText: response.questionText,
      type: response.type,
      explanation: response.explanation,
      orderIndex: response.orderIndex,
      points: response.points,
    };
  }

  /**
   * Convert API response to QuizOption model
   */
  private convertQuizOptionResponseToQuizOption(
    response: QuestionResponse['options'][0]
  ): QuizOption {
    return {
      id: response.id,
      questionId: response.questionId,
      optionText: response.optionText,
      isCorrect: response.isCorrect,
      orderIndex: response.orderIndex,
    };
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Fehler: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben.';
          break;
        case 401:
          errorMessage = 'Nicht autorisiert. Bitte melden Sie sich erneut an.';
          break;
        case 403:
          errorMessage = 'Zugriff verweigert. Sie haben keine Berechtigung für diese Aktion.';
          break;
        case 404:
          errorMessage = 'Die angeforderte Ressource wurde nicht gefunden.';
          break;
        case 500:
          errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
          break;
        default:
          errorMessage = `Serverfehler: ${error.status}`;
      }
    }

    console.error('HTTP Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Validate that a course ID is valid and not undefined/empty
   */
  private isValidCourseId(courseId: string | undefined | null): boolean {
    return !!courseId && courseId !== 'undefined' && courseId !== 'null' && courseId.trim() !== '';
  }

  /**
   * Load all courses (initial load and refresh)
   */
  private loadCourses(): void {
    this.http
      .get<CoursesListResponse>(`${this.apiUrl}/courses`)
      .pipe(
        map(response => response.courses.map(c => this.convertCourseResponseToCourse(c))),
        catchError(() => of([]))
      )
      .subscribe(courses => this.coursesCache.next(courses));
  }

  // ============================================================================
  // COURSE METHODS
  // ============================================================================

  /**
   * Get all courses
   */
  getAllCourses(): Observable<Course[]> {
    return this.http.get<CoursesListResponse>(`${this.apiUrl}/courses`).pipe(
      map(response => response.courses.map(c => this.convertCourseResponseToCourse(c))),
      tap(courses => this.coursesCache.next(courses)),
      catchError(this.handleError)
    );
  }

  /**
   * Get a specific course by ID
   */
  getCourseById(courseId: string): Observable<Course | undefined> {
    if (!this.isValidCourseId(courseId)) {
      console.error('getCourseById called with invalid courseId:', courseId);
      return of(undefined);
    }
    return this.http.get<CourseResponse>(`${this.apiUrl}/courses/${courseId}`).pipe(
      map(response => this.convertCourseResponseToCourse(response)),
      catchError(error => {
        if (error.status === 404) {
          return of(undefined);
        }
        return this.handleError(error);
      })
    );
  }

  // ============================================================================
  // LESSON METHODS
  // ============================================================================

  /**
   * Get all lessons for a specific course (sorted by orderIndex)
   */
  getLessonsByCourseId(courseId: string): Observable<Lesson[]> {
    if (!this.isValidCourseId(courseId)) {
      console.error('getLessonsByCourseId called with invalid courseId:', courseId);
      return of([]);
    }
    return this.http.get<LessonsListResponse>(`${this.apiUrl}/courses/${courseId}/lessons`).pipe(
      map(response =>
        response.lessons
          .map(l => this.convertLessonResponseToLesson(l))
          .sort((a, b) => a.orderIndex - b.orderIndex)
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Get a specific lesson by ID
   */
  getLessonById(lessonId: string): Observable<Lesson | undefined> {
    return this.http.get<LessonResponse>(`${this.apiUrl}/lessons/${lessonId}`).pipe(
      map(response => this.convertLessonResponseToLesson(response)),
      catchError(error => {
        if (error.status === 404) {
          return of(undefined);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Get all content items for a specific lesson (sorted by orderIndex)
   */
  getLessonContents(lessonId: string): Observable<LessonContent[]> {
    return this.http
      .get<LessonContentsListResponse>(`${this.apiUrl}/lessons/${lessonId}/contents`)
      .pipe(
        map(response =>
          response.contents
            .map(c => this.convertLessonContentResponseToLessonContent(c))
            .sort((a, b) => a.orderIndex - b.orderIndex)
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Get lesson content (markdown)
   * @deprecated Use getLessonContents instead for the new multi-content structure
   */
  getLessonContent(lessonId: string): Observable<string> {
    return this.getLessonContents(lessonId).pipe(
      map(contents => {
        const textContents = contents.filter(c => c.contentType === 'text');
        return textContents.map(c => c.contentValue).join('\n\n---\n\n') || '# Inhalt nicht gefunden';
      })
    );
  }

  /**
   * Get the next lesson in the course
   */
  getNextLesson(currentLessonId: string): Observable<Lesson | undefined> {
    return this.getLessonById(currentLessonId).pipe(
      switchMap(currentLesson => {
        if (!currentLesson) {
          return of(undefined);
        }
        return this.getLessonsByCourseId(currentLesson.courseId).pipe(
          map(lessons => {
            const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
            if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
              return lessons[currentIndex + 1];
            }
            return undefined;
          })
        );
      }),
      catchError(() => of(undefined))
    );
  }

  /**
   * Get the previous lesson in the course
   */
  getPreviousLesson(currentLessonId: string): Observable<Lesson | undefined> {
    return this.getLessonById(currentLessonId).pipe(
      switchMap(currentLesson => {
        if (!currentLesson) {
          return of(undefined);
        }
        return this.getLessonsByCourseId(currentLesson.courseId).pipe(
          map(lessons => {
            const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
            if (currentIndex > 0) {
              return lessons[currentIndex - 1];
            }
            return undefined;
          })
        );
      }),
      catchError(() => of(undefined))
    );
  }

  /**
   * Check if a lesson is accessible based on previous lesson completion
   */
  isLessonAccessible(lessonId: string): Observable<boolean> {
    return this.getLessonById(lessonId).pipe(
      switchMap(lesson => {
        if (!lesson) {
          return of(false);
        }
        
        // Check if user is enrolled in the course first
        return this.isUserEnrolledInCourse(lesson.courseId).pipe(
          switchMap(isEnrolled => {
            if (!isEnrolled) {
              return of(false);
            }

            return combineLatest([
              of(lesson),
              this.getLessonsByCourseId(lesson.courseId),
              this.getLessonProgress(lessonId),
            ]).pipe(
              switchMap(([_currentLesson, courseLessons, currentProgress]) => {
                const currentIndex = courseLessons.findIndex((l: Lesson) => l.id === lessonId);
                if (currentIndex === -1) return of(false);

                // First lesson is always accessible if enrolled
                if (currentIndex === 0) return of(true);

                // Check if current lesson is already completed (allow review)
                if (currentProgress?.isCompleted) return of(true);

                // Check if previous lesson is completed
                const previousLesson = courseLessons[currentIndex - 1];
                return this.getLessonProgress(previousLesson.id).pipe(
                  map(previousProgress => previousProgress?.isCompleted || false)
                );
              })
            );
          })
        );
      }),
      catchError(() => of(false))
    );
  }

  // ============================================================================
  // QUIZ METHODS
  // ============================================================================

  /**
   * Get quiz by lesson ID
   */
  getQuizByLessonId(lessonId: string): Observable<Quiz | undefined> {
    return this.http.get<QuizResponse>(`${this.apiUrl}/quizzes/lesson/${lessonId}`).pipe(
      map(response => this.convertQuizResponseToQuiz(response)),
      catchError(error => {
        if (error.status === 404) {
          return of(undefined);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Get quiz by ID
   */
  getQuizById(quizId: string): Observable<Quiz | undefined> {
    return this.http.get<QuizResponse>(`${this.apiUrl}/quizzes/${quizId}`).pipe(
      map(response => this.convertQuizResponseToQuiz(response)),
      catchError(error => {
        if (error.status === 404) {
          return of(undefined);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Get all questions for a quiz with their options (sorted by orderIndex)
   */
  getQuestionsByQuizId(quizId: string): Observable<Question[]> {
    return this.http.get<QuestionsListResponse>(`${this.apiUrl}/quizzes/${quizId}/questions`).pipe(
      map(response =>
        response.questions
          .map(q => this.convertQuestionResponseToQuestion(q))
          .sort((a, b) => a.orderIndex - b.orderIndex)
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Get options for a question (sorted by orderIndex)
   */
  getOptionsByQuestionId(questionId: string): Observable<QuizOption[]> {
    // Get the quiz questions which include options
    return this.http.get<QuestionsListResponse>(`${this.apiUrl}/quizzes/0/questions`).pipe(
      map(response => {
        const question = response.questions.find(q => q.id === questionId);
        if (!question) return [];
        return question.options
          .map(o => this.convertQuizOptionResponseToQuizOption(o))
          .sort((a, b) => a.orderIndex - b.orderIndex);
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Submit quiz attempt and calculate score
   */
  submitQuizAttempt(
    quizId: string,
    lessonId: string,
    answers: { questionId: string; selectedOptionIds: string[] }[]
  ): Observable<UserQuizAttempt> {
    const request: SubmitQuizAttemptRequest = {
      lessonId,
      answers,
    };

    return this.http.post<QuizAttemptResponse>(`${this.apiUrl}/quizzes/${quizId}/attempts`, request).pipe(
      map(response => ({
        id: response.id,
        userId: response.userId,
        quizId: response.quizId,
        lessonId: response.lessonId,
        score: response.score,
        passed: response.passed,
        attemptNumber: response.attemptNumber,
        timeTakenMinutes: undefined,
        answers: response.answers,
        completedAt: new Date(response.completedAt),
      })),
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // USER PROGRESS METHODS
  // ============================================================================

  /**
   * Get user progress for a specific lesson
   */
  getLessonProgress(lessonId: string): Observable<UserProgress | undefined> {
    return this.http.get<LessonProgressResponse>(`${this.apiUrl}/progress/lessons/${lessonId}`).pipe(
      map(response => ({
        id: response.id,
        userId: response.userId,
        lessonId: response.lessonId,
        isCompleted: response.isCompleted,
        bestScore: response.bestScore,
        attemptCount: response.attemptCount,
        timeSpentMinutes: response.timeSpentMinutes,
        lastAttemptAt: response.lastAttemptAt ? new Date(response.lastAttemptAt) : undefined,
        completedAt: response.completedAt ? new Date(response.completedAt) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      catchError(error => {
        if (error.status === 404) {
          return of(undefined);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Get all progress for a course
   */
  getCourseProgress(courseId: string): Observable<CourseProgress> {
    return this.http.get<CourseProgressResponse>(`${this.apiUrl}/progress/courses/${courseId}`).pipe(
      map(response => ({
        courseId: response.courseId,
        progress: response.progress,
        completedLessons: response.completedLessons,
        totalLessons: response.totalLessons,
        lastAccessedLessonId: response.lastAccessedLessonId,
      })),
      catchError(_error => {
        // Return empty progress on error
        return of({
          courseId,
          progress: 0,
          completedLessons: 0,
          totalLessons: 0,
        });
      })
    );
  }

  /**
   * Mark lesson as completed (for lessons without quizzes)
   */
  markLessonCompleted(lessonId: string): Observable<void> {
    return this.http.post<CompleteLessonResponse>(`${this.apiUrl}/progress/lessons/${lessonId}/complete`, {}).pipe(
      map(() => undefined),
      catchError(this.handleError)
    );
  }

  /**
   * Update last accessed lesson
   */
  updateLastAccessedLesson(lessonId: string): Observable<void> {
    return this.http.put(`${this.apiUrl}/progress/lessons/${lessonId}/access`, {}).pipe(
      map(() => undefined),
      catchError(() => of(undefined))
    );
  }

  // ============================================================================
  // ENROLLMENT METHODS
  // ============================================================================

  /**
   * Get user's enrolled courses with progress
   * 
   * NOTE: This method makes multiple API calls (N+1 pattern) because the backend
   * returns a simple enrollment array instead of the documented nested structure.
   * For optimal performance, the backend should be updated to return enriched data
   * in a single call. This is a frontend workaround for the API mismatch.
   */
  getUserEnrolledCourses(): Observable<
    {
      course: Course;
      enrollment: UserCourseEnrollment;
      progressPercentage: number;
      completedLessons: number;
      totalLessons: number;
    }[]
  > {
    return this.http.get<ActualEnrolledCoursesResponse>(`${this.apiUrl}/enrollments/my-courses`).pipe(
      switchMap(response => {
        if (response.enrollments.length === 0) {
          return of([]);
        }

        // For each enrollment, fetch the course details and progress
        const enrichedEnrollments = response.enrollments.map(enrollment =>
          combineLatest([
            this.getCourseById(enrollment.course_id),
            this.getCourseProgress(enrollment.course_id),
          ]).pipe(
            map(([course, progress]) => {
              if (!course) {
                return null;
              }
              return {
                course,
                enrollment: {
                  id: enrollment.id,
                  userId: enrollment.user_id,
                  courseId: enrollment.course_id,
                  enrolledAt: new Date(enrollment.enrolled_at),
                  lastAccessedAt: enrollment.last_accessed_at
                    ? new Date(enrollment.last_accessed_at)
                    : undefined,
                },
                progressPercentage: progress.progress,
                completedLessons: progress.completedLessons,
                totalLessons: progress.totalLessons,
              };
            })
          )
        );

        return combineLatest(enrichedEnrollments).pipe(
          map(results => results.filter(r => r !== null) as {
            course: Course;
            enrollment: UserCourseEnrollment;
            progressPercentage: number;
            completedLessons: number;
            totalLessons: number;
          }[])
        );
      }),
      catchError(error => {
        console.error('Error fetching enrolled courses:', error);
        return of([]);
      })
    );
  }

  /**
   * Enroll user in a course
   */
  enrollUserInCourse(courseId: string): Observable<void> {
    return this.http.post(`${this.apiUrl}/enrollments/courses/${courseId}`, {}).pipe(
      map(() => undefined),
      catchError(this.handleError)
    );
  }

  /**
   * Check if user is enrolled in a course
   * 
   * NOTE: This method calls getUserEnrolledCourses() which makes multiple API calls.
   * For better performance, consider implementing a dedicated backend endpoint to check
   * enrollment status for a specific course (e.g., GET /api/enrollments/check/:courseId).
   */
  isUserEnrolledInCourse(courseId: string): Observable<boolean> {
    return this.getUserEnrolledCourses().pipe(
      map(enrollments => enrollments.some(e => e.course.id === courseId)),
      catchError(() => of(false))
    );
  }

  /**
   * Update last accessed date for a course
   */
  updateCourseLastAccessed(_courseId: string): Observable<void> {
    // This can be done by accessing a lesson in the course
    // or by a dedicated endpoint if available
    return of(undefined);
  }

  /**
   * Get first incomplete lesson for a course (or first lesson if all complete)
   */
  getFirstIncompleteLessonForCourse(courseId: string): Observable<Lesson | undefined> {
    return this.getLessonsByCourseId(courseId).pipe(
      switchMap(lessons => {
        if (lessons.length === 0) {
          return of(undefined);
        }

        // Get progress for all lessons
        const progressChecks = lessons.map(lesson =>
          this.getLessonProgress(lesson.id).pipe(
            map(progress => ({ lesson, progress }))
          )
        );

        return combineLatest(progressChecks).pipe(
          map(lessonsWithProgress => {
            // Find first incomplete lesson
            const incomplete = lessonsWithProgress.find(
              lwp => !lwp.progress || !lwp.progress.isCompleted
            );
            if (incomplete) {
              return incomplete.lesson;
            }
            // If all completed, return first lesson
            return lessons[0];
          })
        );
      }),
      catchError(() => of(undefined))
    );
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Reset user progress (for testing purposes)
   */
  resetProgress(): Observable<void> {
    return this.http.get(`${this.apiUrl}/progress/reset`).pipe(
      map(() => undefined),
      catchError(() => of(undefined))
    );
  }

  // ============================================================================
  // LEGACY/COMPATIBILITY METHODS (for backward compatibility)
  // ============================================================================

  /**
   * @deprecated Use getAllCourses instead
   */
  getAllModules(): Observable<Course[]> {
    return this.getAllCourses();
  }

  /**
   * @deprecated Use getCourseById instead
   */
  getModuleById(moduleId: string): Observable<Course | undefined> {
    return this.getCourseById(moduleId);
  }
}
