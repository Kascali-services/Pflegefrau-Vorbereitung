import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Module, Chapter, Lesson, Quiz } from '../../models/course.model';
import { UserProgress, QuizScore } from '../../models/progress.model';
import { UserCourseEnrollment } from '../../models/user.model';
import { UserService } from './user.service';
import { MOCK_MODULES, MOCK_QUIZZES } from '../data/mock-courses.data';

/**
 * CourseService - Manages course data and user progress
 * Currently uses in-memory data; can be extended to use HTTP API
 */
@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private userService = inject(UserService);

  private modulesSubject = new BehaviorSubject<Module[]>([]);
  private quizzesSubject = new BehaviorSubject<Quiz[]>([]);
  private progressSubject = new BehaviorSubject<UserProgress>({
    completedLessons: [],
    quizScores: [],
    totalProgress: 0,
    moduleProgress: [],
  });
  private enrollmentsSubject = new BehaviorSubject<UserCourseEnrollment[]>([]);

  modules$ = this.modulesSubject.asObservable();
  quizzes$ = this.quizzesSubject.asObservable();
  progress$ = this.progressSubject.asObservable();
  enrollments$ = this.enrollmentsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  /**
   * Get all modules
   */
  getAllModules(): Observable<Module[]> {
    return this.modules$;
  }

  /**
   * Get a specific module by ID
   */
  getModuleById(moduleId: string): Observable<Module | undefined> {
    return this.modules$.pipe(map(modules => modules.find(m => m.id === moduleId)));
  }

  /**
   * Get all chapters for a specific module
   */
  getChaptersByModuleId(moduleId: string): Observable<Chapter[]> {
    return this.modules$.pipe(
      map(modules => {
        const module = modules.find(m => m.id === moduleId);
        return module?.chapters || [];
      })
    );
  }

  /**
   * Get a specific chapter by ID
   */
  getChapterById(chapterId: string): Observable<Chapter | undefined> {
    return this.modules$.pipe(
      map(modules => {
        for (const module of modules) {
          const chapter = module.chapters.find(c => c.id === chapterId);
          if (chapter) return chapter;
        }
        return undefined;
      })
    );
  }

  /**
   * Get all lessons for a specific chapter
   */
  getLessonsByChapterId(chapterId: string): Observable<Lesson[]> {
    return this.getChapterById(chapterId).pipe(map(chapter => chapter?.lessons || []));
  }

  /**
   * Get a specific lesson by ID
   */
  getLessonById(lessonId: string): Observable<Lesson | undefined> {
    return this.modules$.pipe(
      map(modules => {
        for (const module of modules) {
          for (const chapter of module.chapters) {
            const lesson = chapter.lessons.find(l => l.id === lessonId);
            if (lesson) return lesson;
          }
        }
        return undefined;
      })
    );
  }

  /**
   * Get a quiz by ID
   */
  getQuizById(quizId: string): Observable<Quiz | undefined> {
    return this.quizzes$.pipe(map(quizzes => quizzes.find(q => q.id === quizId)));
  }

  /**
   * Get user progress
   */
  getUserProgress(): Observable<UserProgress> {
    return this.progress$;
  }

  /**
   * Check if a lesson is accessible based on prerequisites
   */
  isLessonAccessible(lessonId: string): Observable<boolean> {
    return this.modules$.pipe(
      map(modules => {
        const progress = this.progressSubject.value;

        // Find the lesson and its chapter
        for (const module of modules) {
          for (const chapter of module.chapters) {
            const lessonIndex = chapter.lessons.findIndex(l => l.id === lessonId);
            if (lessonIndex !== -1) {
              const currentLesson = chapter.lessons[lessonIndex];

              // If lesson is already completed, always allow access (for review)
              if (progress.completedLessons.includes(currentLesson.id)) {
                return true;
              }

              // First lesson is always accessible
              if (lessonIndex === 0 && chapter.order === 1) {
                return true;
              }

              // Check if previous lesson is completed
              if (lessonIndex > 0) {
                const previousLesson = chapter.lessons[lessonIndex - 1];
                const isPreviousCompleted = progress.completedLessons.includes(previousLesson.id);

                // If previous lesson had a quiz, check if it was passed
                if (previousLesson.quizId) {
                  const quizScore = progress.quizScores.find(
                    qs => qs.quizId === previousLesson.quizId
                  );
                  return isPreviousCompleted && (quizScore?.passed || false);
                }

                return isPreviousCompleted;
              }

              // Check if previous chapter's last lesson is completed
              const prevChapter = module.chapters.find(c => c.order === chapter.order - 1);
              if (prevChapter) {
                const lastLesson = prevChapter.lessons[prevChapter.lessons.length - 1];
                const isLastLessonCompleted = progress.completedLessons.includes(lastLesson.id);

                // Check quiz if exists
                if (lastLesson.quizId) {
                  const quizScore = progress.quizScores.find(qs => qs.quizId === lastLesson.quizId);
                  return isLastLessonCompleted && (quizScore?.passed || false);
                }

                return isLastLessonCompleted;
              }

              return false;
            }
          }
        }
        return false;
      })
    );
  }

  /**
   * Get the next lesson after completing current one
   */
  getNextLesson(currentLessonId: string): Observable<Lesson | undefined> {
    return this.modules$.pipe(
      map(modules => {
        for (const module of modules) {
          for (const chapter of module.chapters) {
            const currentIndex = chapter.lessons.findIndex(l => l.id === currentLessonId);

            if (currentIndex !== -1) {
              // Check if there's a next lesson in current chapter
              if (currentIndex < chapter.lessons.length - 1) {
                return chapter.lessons[currentIndex + 1];
              }

              // Look for first lesson of next chapter
              const nextChapter = module.chapters.find(c => c.order === chapter.order + 1);
              if (nextChapter && nextChapter.lessons.length > 0) {
                return nextChapter.lessons[0];
              }
            }
          }
        }
        return undefined;
      })
    );
  }

  /**
   * Get user's enrolled courses with progress information
   */
  getUserEnrolledCourses(): Observable<
    {
      module: Module;
      enrollment: UserCourseEnrollment;
      progressPercentage: number;
      completedChapters: number;
      totalChapters: number;
    }[]
  > {
    return combineLatest([this.modules$, this.enrollments$, this.progress$]).pipe(
      map(([modules, enrollments, progress]) => {
        return enrollments
          .map(enrollment => {
            const module = modules.find(m => m.id === enrollment.moduleId);
            if (!module) {
              return null;
            }

            const moduleProgress = progress.moduleProgress.find(
              mp => mp.moduleId === enrollment.moduleId
            );

            return {
              module,
              enrollment,
              progressPercentage: moduleProgress?.progress || 0,
              completedChapters: moduleProgress?.completedChapters || 0,
              totalChapters: module.chapters.length,
            };
          })
          .filter(item => item !== null) as {
          module: Module;
          enrollment: UserCourseEnrollment;
          progressPercentage: number;
          completedChapters: number;
          totalChapters: number;
        }[];
      })
    );
  }

  /**
   * Enroll user in a course
   */
  enrollUserInCourse(moduleId: string): Observable<void> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return;

        const enrollments = this.enrollmentsSubject.value;
        const existingEnrollment = enrollments.find(
          e => e.userId === user.id && e.moduleId === moduleId
        );

        if (!existingEnrollment) {
          const newEnrollment: UserCourseEnrollment = {
            userId: user.id,
            moduleId,
            startDate: new Date(),
            lastAccessedDate: new Date(),
          };
          enrollments.push(newEnrollment);
          this.enrollmentsSubject.next(enrollments);
        }
      })
    );
  }

  /**
   * Update last accessed date for a course
   */
  updateCourseLastAccessed(moduleId: string): Observable<void> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return;

        const enrollments = this.enrollmentsSubject.value;
        const enrollment = enrollments.find(e => e.userId === user.id && e.moduleId === moduleId);

        if (enrollment) {
          enrollment.lastAccessedDate = new Date();
          this.enrollmentsSubject.next([...enrollments]);
        }
      })
    );
  }

  /**
   * Check if user is enrolled in a course
   */
  isUserEnrolledInCourse(moduleId: string): Observable<boolean> {
    return combineLatest([this.userService.getCurrentUser(), this.enrollments$]).pipe(
      map(([user, enrollments]) => {
        if (!user) return false;
        return enrollments.some(e => e.userId === user.id && e.moduleId === moduleId);
      })
    );
  }

  /**
   * Check if user has any progress in a course
   */
  hasUserProgressInCourse(moduleId: string): Observable<boolean> {
    return this.modules$.pipe(
      map(modules => {
        const module = modules.find(m => m.id === moduleId);
        if (!module) return false;

        const progress = this.progressSubject.value;

        // Check if any lesson in this module is completed
        for (const chapter of module.chapters) {
          for (const lesson of chapter.lessons) {
            if (progress.completedLessons.includes(lesson.id)) {
              return true;
            }
          }
        }

        // Check if last accessed lesson is in this module
        if (progress.lastAccessedLesson) {
          for (const chapter of module.chapters) {
            if (chapter.lessons.some(l => l.id === progress.lastAccessedLesson)) {
              return true;
            }
          }
        }

        return false;
      })
    );
  }

  /**
   * Mark a lesson as completed
   */
  markLessonCompleted(lessonId: string): Observable<void> {
    const currentProgress = this.progressSubject.value;
    if (!currentProgress.completedLessons.includes(lessonId)) {
      currentProgress.completedLessons.push(lessonId);
      this.updateProgress(currentProgress);
    }
    return of(void 0);
  }

  /**
   * Save quiz score
   */
  saveQuizScore(quizScore: QuizScore): Observable<void> {
    const currentProgress = this.progressSubject.value;
    const existingIndex = currentProgress.quizScores.findIndex(
      qs => qs.quizId === quizScore.quizId
    );

    if (existingIndex >= 0) {
      currentProgress.quizScores[existingIndex] = quizScore;
    } else {
      currentProgress.quizScores.push(quizScore);
    }

    this.updateProgress(currentProgress);
    return of(void 0);
  }

  /**
   * Check if a quiz has been passed
   */
  isQuizPassed(quizId: string): Observable<boolean> {
    return this.progress$.pipe(
      map(progress => {
        const quizScore = progress.quizScores.find(qs => qs.quizId === quizId);
        return quizScore?.passed || false;
      })
    );
  }

  /**
   * Update last accessed lesson
   */
  updateLastAccessedLesson(lessonId: string): Observable<void> {
    const currentProgress = this.progressSubject.value;
    currentProgress.lastAccessedLesson = lessonId;
    this.progressSubject.next(currentProgress);
    return of(void 0);
  }

  /**
   * Get last accessed lesson for a module or the first incomplete lesson if none accessed
   */
  getLastAccessedLessonForModule(moduleId: string): Observable<Lesson | undefined> {
    return this.modules$.pipe(
      map(modules => {
        const module = modules.find(m => m.id === moduleId);
        if (!module) return undefined;

        const progress = this.progressSubject.value;

        // Find the first incomplete lesson
        for (const chapter of module.chapters) {
          for (const lesson of chapter.lessons) {
            if (!progress.completedLessons.includes(lesson.id)) {
              return lesson;
            }
          }
        }

        // If all lessons are completed, return the first lesson
        if (module.chapters.length > 0 && module.chapters[0].lessons.length > 0) {
          return module.chapters[0].lessons[0];
        }

        return undefined;
      })
    );
  }

  /**
   * Calculate and update overall progress
   */
  private updateProgress(progress: UserProgress): void {
    const modules = this.modulesSubject.value;
    const totalLessons = modules.reduce(
      (acc, module) =>
        acc +
        module.chapters.reduce((chapterAcc, chapter) => chapterAcc + chapter.lessons.length, 0),
      0
    );

    progress.totalProgress = totalLessons
      ? (progress.completedLessons.length / totalLessons) * 100
      : 0;

    // Update module progress
    progress.moduleProgress = modules.map(module => {
      const moduleLessons = module.chapters.reduce(
        (acc, chapter) => acc.concat(chapter.lessons.map(lesson => lesson.id)),
        [] as string[]
      );
      const completedInModule = moduleLessons.filter(lessonId =>
        progress.completedLessons.includes(lessonId)
      ).length;
      const completedChapters = module.chapters.filter(chapter =>
        chapter.lessons.every(lesson => progress.completedLessons.includes(lesson.id))
      ).length;

      return {
        moduleId: module.id,
        progress: moduleLessons.length ? (completedInModule / moduleLessons.length) * 100 : 0,
        completedChapters,
      };
    });

    this.progressSubject.next(progress);
  }

  /**
   * Initialize mock data for development
   */
  private initializeMockData(): void {
    this.modulesSubject.next(MOCK_MODULES);
    this.quizzesSubject.next(MOCK_QUIZZES);

    // Initialize mock enrollments
    this.userService.getCurrentUser().subscribe(user => {
      if (user) {
        const mockEnrollments: UserCourseEnrollment[] = [
          {
            userId: user.id,
            moduleId: 'module-1',
            startDate: new Date('2025-01-15'),
            lastAccessedDate: new Date('2025-02-10'),
          },
          {
            userId: user.id,
            moduleId: 'module-2',
            startDate: new Date('2025-02-01'),
            lastAccessedDate: new Date('2025-02-08'),
          },
        ];
        this.enrollmentsSubject.next(mockEnrollments);

        // Initialize some mock progress
        const mockProgress: UserProgress = {
          userId: user.id,
          completedLessons: ['lesson-1', 'lesson-2'],
          quizScores: [
            {
              quizId: 'quiz-1',
              score: 90,
              attempts: 1,
              lastAttempt: new Date('2025-02-05'),
              passed: true,
            },
          ],
          totalProgress: 0,
          moduleProgress: [],
        };
        this.updateProgress(mockProgress);
      }
    });
  }

  /**
   * Reset user progress (for testing purposes)
   */
  resetProgress(): Observable<void> {
    this.progressSubject.next({
      completedLessons: [],
      quizScores: [],
      totalProgress: 0,
      moduleProgress: [],
    });
    return of(void 0);
  }
}
