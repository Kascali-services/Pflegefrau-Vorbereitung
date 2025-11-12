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

  it('should return all courses', done => {
    service.getAllCourses().subscribe(courses => {
      expect(courses.length).toBeGreaterThan(0);
      expect(courses[0].id).toBeDefined();
      expect(courses[0].title).toBeDefined();
      done();
    });
  });

  it('should get course by id', done => {
    service.getCourseById('course-1').subscribe(course => {
      expect(course).toBeDefined();
      expect(course?.id).toBe('course-1');
      done();
    });
  });

  it('should get lessons by course id', done => {
    service.getLessonsByCourseId('course-1').subscribe(lessons => {
      expect(lessons.length).toBeGreaterThan(0);
      expect(lessons[0].id).toBeDefined();
      expect(lessons[0].courseId).toBe('course-1');
      done();
    });
  });

  it('should mark lesson as completed', done => {
    service.markLessonCompleted('lesson-1').subscribe(() => {
      service.getLessonProgress('lesson-1').subscribe(progress => {
        expect(progress?.isCompleted).toBe(true);
        done();
      });
    });
  });

  it('should get lesson contents', done => {
    service.getLessonContents('lesson-1').subscribe(contents => {
      expect(contents).toBeDefined();
      expect(contents.length).toBeGreaterThan(0);
      expect(contents[0].lessonId).toBe('lesson-1');
      expect(contents[0].contentType).toBeDefined();
      expect(contents[0].contentValue).toBeDefined();
      done();
    });
  });

  it('should update last accessed lesson', done => {
    service.updateLastAccessedLesson('lesson-2').subscribe(() => {
      service.getLessonProgress('lesson-2').subscribe(progress => {
        expect(progress).toBeDefined();
        done();
      });
    });
  });

  it('should get lesson by id', done => {
    service.getLessonById('lesson-1').subscribe(lesson => {
      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe('lesson-1');
      expect(lesson?.courseId).toBeDefined();
      done();
    });
  });
});
