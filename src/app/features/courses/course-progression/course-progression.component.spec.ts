import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CourseProgressionComponent } from './course-progression.component';
import { CourseService } from '../../../core/services/course.service';

describe('CourseProgressionComponent', () => {
  let component: CourseProgressionComponent;
  let fixture: ComponentFixture<CourseProgressionComponent>;
  let mockCourseService: jasmine.SpyObj<CourseService>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    mockCourseService = jasmine.createSpyObj('CourseService', [
      'getLessonById',
      'getChapterById',
      'getModuleById',
      'getUserProgress',
      'isLessonAccessible',
      'getNextLesson',
      'markLessonCompleted',
      'updateLastAccessedLesson',
    ]);

    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ lessonId: 'lesson-1' }),
      queryParams: of({}),
    });

    // Default return values
    mockCourseService.getUserProgress.and.returnValue(
      of({
        completedLessons: [],
        quizScores: [],
        totalProgress: 0,
        moduleProgress: [],
      })
    );
    mockCourseService.getLessonById.and.returnValue(
      of({
        id: 'lesson-1',
        chapterId: 'chapter-1',
        title: 'Test Lesson',
        content: 'Test content',
        type: 'text',
        duration: 10,
        order: 1,
      })
    );
    mockCourseService.isLessonAccessible.and.returnValue(of(true));
    mockCourseService.getNextLesson.and.returnValue(of(undefined));
    mockCourseService.updateLastAccessedLesson.and.returnValue(of(void 0));
    mockCourseService.getChapterById.and.returnValue(of(undefined));
    mockCourseService.getModuleById.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [CourseProgressionComponent],
      providers: [
        { provide: CourseService, useValue: mockCourseService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseProgressionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load lesson on init', () => {
    fixture.detectChanges();
    expect(mockCourseService.getLessonById).toHaveBeenCalledWith('lesson-1');
  });

  it('should check lesson accessibility', () => {
    fixture.detectChanges();
    expect(mockCourseService.isLessonAccessible).toHaveBeenCalledWith('lesson-1');
  });
});
