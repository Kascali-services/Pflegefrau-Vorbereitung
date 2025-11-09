import { TestBed } from '@angular/core/testing';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let service: CourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all modules', done => {
    service.getAllModules().subscribe(modules => {
      expect(modules.length).toBeGreaterThan(0);
      expect(modules[0].id).toBeDefined();
      expect(modules[0].title).toBeDefined();
      expect(modules[0].chapters).toBeDefined();
      done();
    });
  });

  it('should get module by id', done => {
    service.getModuleById('module-1').subscribe(module => {
      expect(module).toBeDefined();
      expect(module?.id).toBe('module-1');
      done();
    });
  });

  it('should get chapters by module id', done => {
    service.getChaptersByModuleId('module-1').subscribe(chapters => {
      expect(chapters.length).toBeGreaterThan(0);
      expect(chapters[0].id).toBeDefined();
      expect(chapters[0].moduleId).toBeDefined();
      done();
    });
  });

  it('should mark lesson as completed', done => {
    service.markLessonCompleted('lesson-1').subscribe(() => {
      service.getUserProgress().subscribe(progress => {
        expect(progress.completedLessons).toContain('lesson-1');
        done();
      });
    });
  });

  it('should calculate progress correctly', done => {
    service.resetProgress().subscribe(() => {
      service.markLessonCompleted('lesson-1').subscribe(() => {
        service.getUserProgress().subscribe(progress => {
          expect(progress.totalProgress).toBeGreaterThan(0);
          expect(progress.moduleProgress.length).toBeGreaterThan(0);
          done();
        });
      });
    });
  });

  it('should save quiz score', done => {
    const quizScore = {
      quizId: 'quiz-1',
      score: 85,
      attempts: 1,
      lastAttempt: new Date(),
      passed: true,
    };

    service.saveQuizScore(quizScore).subscribe(() => {
      service.getUserProgress().subscribe(progress => {
        expect(progress.quizScores.length).toBeGreaterThan(0);
        expect(progress.quizScores[0].quizId).toBe('quiz-1');
        expect(progress.quizScores[0].score).toBe(85);
        done();
      });
    });
  });

  it('should update last accessed lesson', done => {
    service.updateLastAccessedLesson('lesson-2').subscribe(() => {
      service.getUserProgress().subscribe(progress => {
        expect(progress.lastAccessedLesson).toBe('lesson-2');
        done();
      });
    });
  });

  it('should get lesson by id', done => {
    service.getLessonById('lesson-1').subscribe(lesson => {
      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe('lesson-1');
      expect(lesson?.chapterId).toBe('chapter-1');
      done();
    });
  });
});
