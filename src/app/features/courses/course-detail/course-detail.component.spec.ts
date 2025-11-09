import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { CourseDetailComponent } from './course-detail.component';

describe('CourseDetailComponent', () => {
  let component: CourseDetailComponent;
  let fixture: ComponentFixture<CourseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 'module-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
