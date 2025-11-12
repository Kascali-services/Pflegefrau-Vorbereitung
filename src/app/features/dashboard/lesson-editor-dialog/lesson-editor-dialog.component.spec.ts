import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LessonEditorDialogComponent } from './lesson-editor-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationService } from '../../../core/services/notification.service';

describe('LessonEditorDialogComponent', () => {
  let component: LessonEditorDialogComponent;
  let fixture: ComponentFixture<LessonEditorDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<LessonEditorDialogComponent>>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showConfirmation',
      'showSuccess',
    ]);

    await TestBed.configureTestingModule({
      imports: [LessonEditorDialogComponent, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: NotificationService, useValue: mockNotificationService },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            lesson: {
              id: '1',
              courseId: 'course-1',
              title: 'Test Lesson',
              description: 'Test Description',
              type: 'text',
              durationMinutes: 30,
              orderIndex: 1,
            },
            contents: [],
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LessonEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with lesson data', () => {
    expect(component.lessonForm.get('title')?.value).toBe('Test Lesson');
    expect(component.lessonForm.get('type')?.value).toBe('text');
    expect(component.lessonForm.get('durationMinutes')?.value).toBe(30);
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });
});
