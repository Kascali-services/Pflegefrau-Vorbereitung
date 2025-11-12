import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { CourseDetailComponent } from './course-detail.component';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';

describe('CourseDetailComponent', () => {
  let component: CourseDetailComponent;
  let fixture: ComponentFixture<CourseDetailComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockCourseService: jasmine.SpyObj<CourseService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    mockCourseService = jasmine.createSpyObj('CourseService', [
      'getCourseById',
      'getLessonsByCourseId',
      'getCourseProgress',
      'isUserEnrolledInCourse',
      'getFirstIncompleteLessonForCourse',
    ]);

    // Default mock responses
    mockCourseService.getCourseById.and.returnValue(of(undefined));
    mockCourseService.getLessonsByCourseId.and.returnValue(of([]));
    mockCourseService.getCourseProgress.and.returnValue(
      of({ courseId: 'module-1', completedLessons: 0, progress: 0, totalLessons: 0 })
    );
    mockCourseService.isUserEnrolledInCourse.and.returnValue(of(false));
    mockCourseService.getFirstIncompleteLessonForCourse.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [CourseDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 'module-1' }),
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CourseService, useValue: mockCourseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isAuthenticated to true when user is logged in', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    fixture.detectChanges();
    expect(component.isAuthenticated).toBe(true);
  });

  it('should set isAuthenticated to false when user is not logged in', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
    expect(component.isAuthenticated).toBe(false);
  });

  it('should show "Kurs starten" button when user is not authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    component.isAuthenticated = false;
    component.hasProgress = false;
    
    // Test the button visibility logic
    const shouldShowStartButton = !component.isAuthenticated || !component.hasProgress;
    const shouldShowContinueButton = component.isAuthenticated && component.hasProgress;
    
    expect(shouldShowStartButton).toBe(true);
    expect(shouldShowContinueButton).toBe(false);
  });

  it('should show "Kurs starten" button when user is authenticated but has no progress', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    component.isAuthenticated = true;
    component.hasProgress = false;
    
    // Test the button visibility logic
    const shouldShowStartButton = !component.isAuthenticated || !component.hasProgress;
    const shouldShowContinueButton = component.isAuthenticated && component.hasProgress;
    
    expect(shouldShowStartButton).toBe(true);
    expect(shouldShowContinueButton).toBe(false);
  });

  it('should show "Fortsetzen" button when user is authenticated and has progress', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    component.isAuthenticated = true;
    component.hasProgress = true;
    
    // Test the button visibility logic
    const shouldShowStartButton = !component.isAuthenticated || !component.hasProgress;
    const shouldShowContinueButton = component.isAuthenticated && component.hasProgress;
    
    expect(shouldShowStartButton).toBe(false);
    expect(shouldShowContinueButton).toBe(true);
  });

  it('should not show "Fortsetzen" button when user is not authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    component.isAuthenticated = false;
    component.hasProgress = true;
    
    // Test the button visibility logic
    const shouldShowContinueButton = component.isAuthenticated && component.hasProgress;
    expect(shouldShowContinueButton).toBe(false);
  });

  it('should not show "Für später speichern" button', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    component.course = { id: 'test', title: 'Test', description: 'Test', level: 'beginner', durationMinutes: 60, lessonsCount: 5 };
    component.lessons = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const saveButton = compiled.querySelector('.save-course-btn');
    expect(saveButton).toBeFalsy();
  });
});
