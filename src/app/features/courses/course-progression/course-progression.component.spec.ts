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
      'getCourseById',
      'getLessonContents',
      'getLessonContent',
      'getQuizByLessonId',
      'getLessonProgress',
      'getLessonsByCourseId',
      'isLessonAccessible',
      'getNextLesson',
      'getPreviousLesson',
      'markLessonCompleted',
      'updateLastAccessedLesson',
      'updateCourseLastAccessed',
    ]);

    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ lessonId: 'lesson-1' }),
      queryParams: of({}),
    });

    // Default return values
    mockCourseService.getLessonById.and.returnValue(
      of({
        id: 'lesson-1',
        courseId: 'course-1',
        title: 'Test Lesson',
        description: 'Test description',
        type: 'text',
        durationMinutes: 10,
        orderIndex: 1,
      })
    );
    mockCourseService.getCourseById.and.returnValue(
      of({
        id: 'course-1',
        title: 'Test Course',
        description: 'Test course description',
        level: 'beginner',
        durationMinutes: 60,
        lessonsCount: 3,
      })
    );
    mockCourseService.getLessonContents.and.returnValue(of([]));
    mockCourseService.getLessonContent.and.returnValue(of('Test content'));
    mockCourseService.getQuizByLessonId.and.returnValue(of(undefined));
    mockCourseService.getLessonProgress.and.returnValue(of(undefined));
    mockCourseService.getLessonsByCourseId.and.returnValue(of([]));
    mockCourseService.isLessonAccessible.and.returnValue(of(true));
    mockCourseService.getNextLesson.and.returnValue(of(undefined));
    mockCourseService.getPreviousLesson.and.returnValue(of(undefined));
    mockCourseService.updateLastAccessedLesson.and.returnValue(of(void 0));
    mockCourseService.updateCourseLastAccessed.and.returnValue(of(void 0));

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
