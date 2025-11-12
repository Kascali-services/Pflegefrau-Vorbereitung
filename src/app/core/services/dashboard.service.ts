import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Course, Lesson } from '../../models/course.model';
import { CourseService } from './course.service';

/**
 * DashboardService - Manages dashboard data for content managers and admins
 * Provides methods to list all courses and lessons for editing
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private courseService = inject(CourseService);

  /**
   * Get all courses with their lessons for dashboard view
   */
  getAllCoursesWithLessons(): Observable<
    {
      course: Course;
      lessons: Lesson[];
    }[]
  > {
    return this.courseService.getAllCourses().pipe(
      map(courses => {
        return courses.map(course => ({
          course,
          lessons: [],
        }));
      })
    );
  }

  /**
   * Get lessons for a specific course
   */
  getLessonsByCourseId(courseId: string): Observable<Lesson[]> {
    return this.courseService.getLessonsByCourseId(courseId);
  }

  /**
   * Update a course (mock implementation)
   */
  updateCourse(courseId: string, updates: Partial<Course>): Observable<Course> {
    // Mock implementation - would call backend API in real app
    return this.courseService.getCourseById(courseId).pipe(
      map(course => {
        if (!course) {
          throw new Error('Course not found');
        }
        return { ...course, ...updates };
      })
    );
  }

  /**
   * Update a lesson (mock implementation)
   */
  updateLesson(lessonId: string, updates: Partial<Lesson>): Observable<Lesson> {
    // Mock implementation - would call backend API in real app
    return this.courseService.getLessonById(lessonId).pipe(
      map(lesson => {
        if (!lesson) {
          throw new Error('Lesson not found');
        }
        return { ...lesson, ...updates };
      })
    );
  }
}
