import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CourseFormDialogComponent } from './course-form-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CourseFormDialogComponent', () => {
  let component: CourseFormDialogComponent;
  let fixture: ComponentFixture<CourseFormDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CourseFormDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [CourseFormDialogComponent, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { mode: 'create' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values in create mode', () => {
    expect(component.courseForm.get('title')?.value).toBe('');
    expect(component.courseForm.get('description')?.value).toBe('');
    expect(component.courseForm.get('level')?.value).toBe('beginner');
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should validate required fields', () => {
    expect(component.courseForm.valid).toBeFalse();
    component.courseForm.patchValue({
      title: 'Test Course',
      description: 'Test Description',
      level: 'beginner',
      durationMinutes: 60,
    });
    expect(component.courseForm.valid).toBeTrue();
  });
});
