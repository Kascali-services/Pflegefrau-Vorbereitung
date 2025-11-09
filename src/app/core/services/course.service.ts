import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Module, Chapter, Lesson, Quiz } from '../../models/course.model';
import { UserProgress, QuizScore } from '../../models/progress.model';

/**
 * CourseService - Manages course data and user progress
 * Currently uses in-memory data; can be extended to use HTTP API
 */
@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private modulesSubject = new BehaviorSubject<Module[]>([]);
  private progressSubject = new BehaviorSubject<UserProgress>({
    completedLessons: [],
    quizScores: [],
    totalProgress: 0,
    moduleProgress: [],
  });

  modules$ = this.modulesSubject.asObservable();
  progress$ = this.progressSubject.asObservable();

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getQuizById(_quizId: string): Observable<Quiz | undefined> {
    // In a real implementation, this would fetch from a separate quiz store
    // For now, return undefined as quizzes are referenced but not stored in modules
    return of(undefined);
  }

  /**
   * Get user progress
   */
  getUserProgress(): Observable<UserProgress> {
    return this.progress$;
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
   * Update last accessed lesson
   */
  updateLastAccessedLesson(lessonId: string): Observable<void> {
    const currentProgress = this.progressSubject.value;
    currentProgress.lastAccessedLesson = lessonId;
    this.progressSubject.next(currentProgress);
    return of(void 0);
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
    const mockModules: Module[] = [
      {
        id: 'module-1',
        title: 'Vocabulaire anatomique',
        description: 'Apprenez les termes anatomiques essentiels',
        level: 'beginner',
        icon: 'school',
        chapters: [
          {
            id: 'chapter-1',
            moduleId: 'module-1',
            title: "Introduction à l'anatomie",
            lessons: [
              {
                id: 'lesson-1',
                chapterId: 'chapter-1',
                title: "Les bases de l'anatomie",
                content:
                  "# Les bases de l'anatomie\n\nL'anatomie est l'étude de la structure du corps humain...",
                type: 'text',
                duration: 15,
                order: 1,
              },
              {
                id: 'lesson-2',
                chapterId: 'chapter-1',
                title: 'Terminologie anatomique',
                content:
                  '# Terminologie anatomique\n\nLa terminologie anatomique utilise des termes spécifiques...',
                type: 'text',
                quizId: 'quiz-1',
                duration: 20,
                order: 2,
              },
            ],
            estimatedTime: 35,
            order: 1,
          },
          {
            id: 'chapter-2',
            moduleId: 'module-1',
            title: 'Systèmes corporels',
            lessons: [
              {
                id: 'lesson-3',
                chapterId: 'chapter-2',
                title: 'Le système squelettique',
                content:
                  '# Le système squelettique\n\nLe système squelettique comprend tous les os du corps...',
                type: 'text',
                duration: 25,
                order: 1,
              },
            ],
            estimatedTime: 25,
            order: 2,
          },
        ],
        createdAt: new Date('2025-01-01'),
      },
      {
        id: 'module-2',
        title: 'Soins infirmiers de base',
        description: 'Techniques fondamentales des soins infirmiers',
        level: 'intermediate',
        icon: 'medical_services',
        chapters: [
          {
            id: 'chapter-3',
            moduleId: 'module-2',
            title: 'Hygiène et sécurité',
            lessons: [
              {
                id: 'lesson-4',
                chapterId: 'chapter-3',
                title: 'Lavage des mains',
                content:
                  '# Lavage des mains\n\nLe lavage des mains est une procédure essentielle...',
                type: 'video',
                duration: 10,
                order: 1,
              },
            ],
            estimatedTime: 10,
            order: 1,
          },
        ],
        createdAt: new Date('2025-01-15'),
      },
    ];

    this.modulesSubject.next(mockModules);
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
