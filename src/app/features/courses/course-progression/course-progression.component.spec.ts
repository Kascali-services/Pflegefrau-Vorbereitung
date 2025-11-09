import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseProgressionComponent } from './course-progression.component';

describe('CourseProgressionComponent', () => {
  let component: CourseProgressionComponent;
  let fixture: ComponentFixture<CourseProgressionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseProgressionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseProgressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
