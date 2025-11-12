import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { QuizComponent } from './quiz.component';
import { CourseService } from '../../../core/services/course.service';

describe('QuizComponent', () => {
  let component: QuizComponent;
  let fixture: ComponentFixture<QuizComponent>;
  let mockCourseService: jasmine.SpyObj<CourseService>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    mockCourseService = jasmine.createSpyObj('CourseService', [
      'getQuizById',
      'getQuestionsByQuizId',
      'getOptionsByQuestionId',
      'submitQuizAttempt',
      'getLessonProgress',
      'getNextLesson',
      'getLessonById',
    ]);

    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ quizId: 'quiz-1' }),
      queryParams: of({ lessonId: 'lesson-1' }),
    });

    // Default return values
    mockCourseService.getQuizById.and.returnValue(of(undefined));
    mockCourseService.getQuestionsByQuizId.and.returnValue(of([]));
    mockCourseService.getOptionsByQuestionId.and.returnValue(of([]));
    mockCourseService.getLessonProgress.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [QuizComponent],
      providers: [
        { provide: CourseService, useValue: mockCourseService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load quiz on init', () => {
    fixture.detectChanges();
    expect(mockCourseService.getQuizById).toHaveBeenCalledWith('quiz-1');
  });

  it('should initialize with correct default values', () => {
    expect(component.currentQuestionIndex).toBe(0);
    expect(component.isSubmitted).toBe(false);
    expect(component.passed).toBe(false);
  });
});
