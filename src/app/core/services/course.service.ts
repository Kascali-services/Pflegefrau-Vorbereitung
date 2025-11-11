import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Course, Lesson, Quiz, Question, QuizOption } from '../../models/course.model';
import { UserProgress, UserQuizAttempt, CourseProgress } from '../../models/progress.model';
import { UserCourseEnrollment } from '../../models/user.model';
import { UserService } from './user.service';
import {
  MOCK_COURSES,
  MOCK_LESSONS,
  MOCK_QUIZZES,
  MOCK_QUESTIONS,
  MOCK_QUIZ_OPTIONS,
  MOCK_ENROLLMENTS,
  MOCK_USER_PROGRESS,
  MOCK_QUIZ_ATTEMPTS,
  MOCK_LESSON_CONTENT,
} from './mock-data';

/**
 * CourseService - Manages course data and user progress
 * Refactored to work with new database schema (Course -> Lesson flat structure)
 * Currently uses in-memory data; can be extended to use HTTP API
 */
@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private userService = inject(UserService);

  // Data stores
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  private lessonsSubject = new BehaviorSubject<Lesson[]>([]);
  private quizzesSubject = new BehaviorSubject<Quiz[]>([]);
  private questionsSubject = new BehaviorSubject<Question[]>([]);
  private quizOptionsSubject = new BehaviorSubject<QuizOption[]>([]);
  private userProgressSubject = new BehaviorSubject<UserProgress[]>([]);
  private quizAttemptsSubject = new BehaviorSubject<UserQuizAttempt[]>([]);
  private enrollmentsSubject = new BehaviorSubject<UserCourseEnrollment[]>([]);

  // Observables
  courses$ = this.coursesSubject.asObservable();
  lessons$ = this.lessonsSubject.asObservable();
  quizzes$ = this.quizzesSubject.asObservable();
  questions$ = this.questionsSubject.asObservable();
  quizOptions$ = this.quizOptionsSubject.asObservable();
  userProgress$ = this.userProgressSubject.asObservable();
  quizAttempts$ = this.quizAttemptsSubject.asObservable();
  enrollments$ = this.enrollmentsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  // ============================================================================
  // COURSE METHODS
  // ============================================================================

  /**
   * Get all courses
   */
  getAllCourses(): Observable<Course[]> {
    return this.courses$;
  }

  /**
   * Get a specific course by ID
   */
  getCourseById(courseId: string): Observable<Course | undefined> {
    return this.courses$.pipe(map(courses => courses.find(c => c.id === courseId)));
  }

  // ============================================================================
  // LESSON METHODS
  // ============================================================================

  /**
   * Get all lessons for a specific course (sorted by orderIndex)
   */
  getLessonsByCourseId(courseId: string): Observable<Lesson[]> {
    return this.lessons$.pipe(
      map(lessons =>
        lessons.filter(l => l.courseId === courseId).sort((a, b) => a.orderIndex - b.orderIndex)
      )
    );
  }

  /**
   * Get a specific lesson by ID
   */
  getLessonById(lessonId: string): Observable<Lesson | undefined> {
    return this.lessons$.pipe(map(lessons => lessons.find(l => l.id === lessonId)));
  }

  /**
   * Get lesson content (markdown)
   */
  getLessonContent(lessonId: string): Observable<string> {
    // In a real app, this would fetch from contentMdPath
    return of(MOCK_LESSON_CONTENT[lessonId] || '# Content not found');
  }

  /**
   * Get the next lesson in the course
   */
  getNextLesson(currentLessonId: string): Observable<Lesson | undefined> {
    return combineLatest([this.lessons$, this.getLessonById(currentLessonId)]).pipe(
      map(([lessons, currentLesson]) => {
        if (!currentLesson) return undefined;

        const courseLessons = lessons
          .filter(l => l.courseId === currentLesson.courseId)
          .sort((a, b) => a.orderIndex - b.orderIndex);

        const currentIndex = courseLessons.findIndex(l => l.id === currentLessonId);
        if (currentIndex >= 0 && currentIndex < courseLessons.length - 1) {
          return courseLessons[currentIndex + 1];
        }

        return undefined;
      })
    );
  }

  /**
   * Get the previous lesson in the course
   */
  getPreviousLesson(currentLessonId: string): Observable<Lesson | undefined> {
    return combineLatest([this.lessons$, this.getLessonById(currentLessonId)]).pipe(
      map(([lessons, currentLesson]) => {
        if (!currentLesson) return undefined;

        const courseLessons = lessons
          .filter(l => l.courseId === currentLesson.courseId)
          .sort((a, b) => a.orderIndex - b.orderIndex);

        const currentIndex = courseLessons.findIndex(l => l.id === currentLessonId);
        if (currentIndex > 0) {
          return courseLessons[currentIndex - 1];
        }

        return undefined;
      })
    );
  }

  /**
   * Check if a lesson is accessible based on previous lesson completion
   */
  isLessonAccessible(lessonId: string): Observable<boolean> {
    return combineLatest([
      this.getLessonById(lessonId),
      this.lessons$,
      this.userProgress$,
      this.userService.getCurrentUser(),
    ]).pipe(
      map(([lesson, lessons, progressRecords, user]) => {
        if (!lesson || !user) return false;

        const courseLessons = lessons
          .filter(l => l.courseId === lesson.courseId)
          .sort((a, b) => a.orderIndex - b.orderIndex);

        const currentIndex = courseLessons.findIndex(l => l.id === lessonId);
        if (currentIndex === -1) return false;

        // First lesson is always accessible
        if (currentIndex === 0) return true;

        // Check if current lesson is already completed (allow review)
        const currentProgress = progressRecords.find(
          p => p.lessonId === lessonId && p.userId === user.id
        );
        if (currentProgress?.isCompleted) return true;

        // Check if previous lesson is completed
        const previousLesson = courseLessons[currentIndex - 1];
        const previousProgress = progressRecords.find(
          p => p.lessonId === previousLesson.id && p.userId === user.id
        );

        return previousProgress?.isCompleted || false;
      })
    );
  }

  // ============================================================================
  // QUIZ METHODS
  // ============================================================================

  /**
   * Get quiz by lesson ID
   */
  getQuizByLessonId(lessonId: string): Observable<Quiz | undefined> {
    return this.quizzes$.pipe(map(quizzes => quizzes.find(q => q.lessonId === lessonId)));
  }

  /**
   * Get quiz by ID
   */
  getQuizById(quizId: string): Observable<Quiz | undefined> {
    return this.quizzes$.pipe(map(quizzes => quizzes.find(q => q.id === quizId)));
  }

  /**
   * Get all questions for a quiz (sorted by orderIndex)
   */
  getQuestionsByQuizId(quizId: string): Observable<Question[]> {
    return this.questions$.pipe(
      map(questions =>
        questions.filter(q => q.quizId === quizId).sort((a, b) => a.orderIndex - b.orderIndex)
      )
    );
  }

  /**
   * Get options for a question (sorted by orderIndex)
   */
  getOptionsByQuestionId(questionId: string): Observable<QuizOption[]> {
    return this.quizOptions$.pipe(
      map(options =>
        options.filter(o => o.questionId === questionId).sort((a, b) => a.orderIndex - b.orderIndex)
      )
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
    return combineLatest([
      this.userService.getCurrentUser(),
      this.getQuizById(quizId),
      this.getQuestionsByQuizId(quizId),
      this.quizOptions$,
      this.quizAttempts$,
      this.userProgress$,
    ]).pipe(
      map(([user, quiz, questions, allOptions, attempts]) => {
        if (!user || !quiz) {
          throw new Error('User or quiz not found');
        }

        // Calculate score
        let correctAnswers = 0;
        const quizAnswers = answers.map(answer => {
          const questionOptions = allOptions.filter(o => o.questionId === answer.questionId);
          const correctOptions = questionOptions.filter(o => o.isCorrect).map(o => o.id);

          // Check if answer is correct
          const isCorrect =
            answer.selectedOptionIds.length === correctOptions.length &&
            answer.selectedOptionIds.every(id => correctOptions.includes(id));

          if (isCorrect) {
            correctAnswers++;
          }

          return {
            questionId: answer.questionId,
            selectedOptions: answer.selectedOptionIds,
            isCorrect,
          };
        });

        const score = Math.round((correctAnswers / questions.length) * 100);
        const passed = score >= quiz.passingScore;

        // Determine attempt number
        const previousAttempts = attempts.filter(a => a.quizId === quizId && a.userId === user.id);
        const attemptNumber = previousAttempts.length + 1;

        // Create new attempt
        const attempt: UserQuizAttempt = {
          id: `attempt-${Date.now()}`,
          userId: user.id,
          quizId,
          lessonId,
          score,
          passed,
          attemptNumber,
          timeTakenMinutes: undefined,
          answers: quizAnswers,
          completedAt: new Date(),
        };

        // Update attempts
        const newAttempts = [...this.quizAttemptsSubject.value, attempt];
        this.quizAttemptsSubject.next(newAttempts);

        // Update user progress
        this.updateProgressAfterQuiz(lessonId, user.id, score, passed);

        return attempt;
      })
    );
  }

  // ============================================================================
  // USER PROGRESS METHODS
  // ============================================================================

  /**
   * Get user progress for a specific lesson
   */
  getLessonProgress(lessonId: string): Observable<UserProgress | undefined> {
    return combineLatest([this.userService.getCurrentUser(), this.userProgress$]).pipe(
      map(([user, progressRecords]) => {
        if (!user) return undefined;
        return progressRecords.find(p => p.lessonId === lessonId && p.userId === user.id);
      })
    );
  }

  /**
   * Get all progress for a course
   */
  getCourseProgress(courseId: string): Observable<CourseProgress> {
    return combineLatest([
      this.userService.getCurrentUser(),
      this.getLessonsByCourseId(courseId),
      this.userProgress$,
    ]).pipe(
      map(([user, lessons, progressRecords]) => {
        if (!user) {
          return {
            courseId,
            progress: 0,
            completedLessons: 0,
            totalLessons: lessons.length,
          };
        }

        const userProgressForCourse = progressRecords.filter(
          p => p.userId === user.id && lessons.some(l => l.id === p.lessonId)
        );

        const completedLessons = userProgressForCourse.filter(p => p.isCompleted).length;
        const progress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

        // Find last accessed lesson
        const lastAccessed = userProgressForCourse
          .filter(p => p.lastAttemptAt || p.completedAt)
          .sort((a, b) => {
            const aDate = a.lastAttemptAt || a.completedAt || new Date(0);
            const bDate = b.lastAttemptAt || b.completedAt || new Date(0);
            return bDate.getTime() - aDate.getTime();
          })[0];

        return {
          courseId,
          progress,
          completedLessons,
          totalLessons: lessons.length,
          lastAccessedLessonId: lastAccessed?.lessonId,
        };
      })
    );
  }

  /**
   * Mark lesson as completed (for lessons without quizzes)
   */
  markLessonCompleted(lessonId: string): Observable<void> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return;

        const progressRecords = this.userProgressSubject.value;
        let progress = progressRecords.find(p => p.lessonId === lessonId && p.userId === user.id);

        if (progress) {
          progress.isCompleted = true;
          progress.completedAt = new Date();
          progress.updatedAt = new Date();
        } else {
          progress = {
            id: `progress-${Date.now()}`,
            userId: user.id,
            lessonId,
            isCompleted: true,
            bestScore: 0,
            attemptCount: 0,
            timeSpentMinutes: 0,
            completedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          progressRecords.push(progress);
        }

        this.userProgressSubject.next([...progressRecords]);
      })
    );
  }

  /**
   * Update progress after quiz completion
   */
  private updateProgressAfterQuiz(
    lessonId: string,
    userId: string,
    score: number,
    passed: boolean
  ): void {
    const progressRecords = this.userProgressSubject.value;
    let progress = progressRecords.find(p => p.lessonId === lessonId && p.userId === userId);

    if (progress) {
      progress.attemptCount++;
      progress.bestScore = Math.max(progress.bestScore, score);
      progress.lastAttemptAt = new Date();
      progress.updatedAt = new Date();

      if (passed && !progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
      }
    } else {
      progress = {
        id: `progress-${Date.now()}`,
        userId,
        lessonId,
        isCompleted: passed,
        bestScore: score,
        attemptCount: 1,
        timeSpentMinutes: 0,
        lastAttemptAt: new Date(),
        completedAt: passed ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      progressRecords.push(progress);
    }

    this.userProgressSubject.next([...progressRecords]);
  }

  /**
   * Update last accessed lesson
   */
  updateLastAccessedLesson(lessonId: string): Observable<void> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return;

        const progressRecords = this.userProgressSubject.value;
        let progress = progressRecords.find(p => p.lessonId === lessonId && p.userId === user.id);

        if (progress) {
          progress.updatedAt = new Date();
        } else {
          progress = {
            id: `progress-${Date.now()}`,
            userId: user.id,
            lessonId,
            isCompleted: false,
            bestScore: 0,
            attemptCount: 0,
            timeSpentMinutes: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          progressRecords.push(progress);
        }

        this.userProgressSubject.next([...progressRecords]);
      })
    );
  }

  // ============================================================================
  // ENROLLMENT METHODS
  // ============================================================================

  /**
   * Get user's enrolled courses with progress
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
    return combineLatest([
      this.userService.getCurrentUser(),
      this.courses$,
      this.enrollments$,
      this.lessons$,
      this.userProgress$,
    ]).pipe(
      map(([user, courses, enrollments, lessons, progressRecords]) => {
        if (!user) return [];

        const userEnrollments = enrollments.filter(e => e.userId === user.id);

        return userEnrollments
          .map(enrollment => {
            const course = courses.find(c => c.id === enrollment.courseId);
            if (!course) return null;

            const courseLessons = lessons.filter(l => l.courseId === course.id);
            const userProgressForCourse = progressRecords.filter(
              p => p.userId === user.id && courseLessons.some(l => l.id === p.lessonId)
            );

            const completedLessons = userProgressForCourse.filter(p => p.isCompleted).length;
            const progressPercentage =
              courseLessons.length > 0 ? (completedLessons / courseLessons.length) * 100 : 0;

            return {
              course,
              enrollment,
              progressPercentage,
              completedLessons,
              totalLessons: courseLessons.length,
            };
          })
          .filter(item => item !== null) as {
          course: Course;
          enrollment: UserCourseEnrollment;
          progressPercentage: number;
          completedLessons: number;
          totalLessons: number;
        }[];
      })
    );
  }

  /**
   * Enroll user in a course
   */
  enrollUserInCourse(courseId: string): Observable<void> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return;

        const enrollments = this.enrollmentsSubject.value;
        const existingEnrollment = enrollments.find(
          e => e.userId === user.id && e.courseId === courseId
        );

        if (!existingEnrollment) {
          const newEnrollment: UserCourseEnrollment = {
            id: `enrollment-${Date.now()}`,
            userId: user.id,
            courseId,
            enrolledAt: new Date(),
            lastAccessedAt: new Date(),
          };
          enrollments.push(newEnrollment);
          this.enrollmentsSubject.next([...enrollments]);
        }
      })
    );
  }

  /**
   * Check if user is enrolled in a course
   */
  isUserEnrolledInCourse(courseId: string): Observable<boolean> {
    return combineLatest([this.userService.getCurrentUser(), this.enrollments$]).pipe(
      map(([user, enrollments]) => {
        if (!user) return false;
        return enrollments.some(e => e.userId === user.id && e.courseId === courseId);
      })
    );
  }

  /**
   * Update last accessed date for a course
   */
  updateCourseLastAccessed(courseId: string): Observable<void> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return;

        const enrollments = this.enrollmentsSubject.value;
        const enrollment = enrollments.find(e => e.userId === user.id && e.courseId === courseId);

        if (enrollment) {
          enrollment.lastAccessedAt = new Date();
          this.enrollmentsSubject.next([...enrollments]);
        }
      })
    );
  }

  /**
   * Get first incomplete lesson for a course (or first lesson if all complete)
   */
  getFirstIncompleteLessonForCourse(courseId: string): Observable<Lesson | undefined> {
    return combineLatest([
      this.getLessonsByCourseId(courseId),
      this.userProgress$,
      this.userService.getCurrentUser(),
    ]).pipe(
      map(([lessons, progressRecords, user]) => {
        if (!user || lessons.length === 0) return undefined;

        // Find first incomplete lesson
        for (const lesson of lessons) {
          const progress = progressRecords.find(
            p => p.lessonId === lesson.id && p.userId === user.id
          );
          if (!progress || !progress.isCompleted) {
            return lesson;
          }
        }

        // If all completed, return first lesson
        return lessons[0];
      })
    );
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize mock data for development
   */
  private initializeMockData(): void {
    this.coursesSubject.next(MOCK_COURSES);
    this.lessonsSubject.next(MOCK_LESSONS);
    this.quizzesSubject.next(MOCK_QUIZZES);
    this.questionsSubject.next(MOCK_QUESTIONS);
    this.quizOptionsSubject.next(MOCK_QUIZ_OPTIONS);
    this.enrollmentsSubject.next(MOCK_ENROLLMENTS);
    this.userProgressSubject.next(MOCK_USER_PROGRESS);
    this.quizAttemptsSubject.next(MOCK_QUIZ_ATTEMPTS);
  }

  /**
   * Reset user progress (for testing purposes)
   */
  resetProgress(): Observable<void> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return;

        // Remove all progress and attempts for current user
        const progressRecords = this.userProgressSubject.value.filter(p => p.userId !== user.id);
        const attempts = this.quizAttemptsSubject.value.filter(a => a.userId !== user.id);

        this.userProgressSubject.next(progressRecords);
        this.quizAttemptsSubject.next(attempts);
      })
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
