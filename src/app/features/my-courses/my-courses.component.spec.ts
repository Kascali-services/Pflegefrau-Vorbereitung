import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCoursesComponent } from './my-courses.component';
import { provideRouter } from '@angular/router';

describe('MyCoursesComponent', () => {
  let component: MyCoursesComponent;
  let fixture: ComponentFixture<MyCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCoursesComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MyCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format date correctly', () => {
    const date = new Date('2025-01-15');
    const formatted = component.formatDate(date);
    expect(formatted).toContain('janvier');
    expect(formatted).toContain('2025');
  });

  it('should return correct progress bar color', () => {
    expect(component.getProgressBarColor(20)).toBe('#f44336');
    expect(component.getProgressBarColor(50)).toBe('#ff9800');
    expect(component.getProgressBarColor(80)).toBe('#4caf50');
  });

  it('should return correct completion status', () => {
    expect(component.getCompletionStatus(0)).toBe('Non commencé');
    expect(component.getCompletionStatus(50)).toBe('En cours');
    expect(component.getCompletionStatus(100)).toBe('Terminé');
  });
});
