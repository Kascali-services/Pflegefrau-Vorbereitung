import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Course, Lesson, LessonContent } from '../../models/course.model';
import { CourseService } from './course.service';

/**
 * LessonEditorService - Manages lesson editing operations
 * Provides CRUD operations for courses, lessons, and lesson contents
 * Uses mock data simulation for API interactions
 */
@Injectable({
  providedIn: 'root',
})
export class LessonEditorService {
  private courseService = inject(CourseService);

  /**
   * Create a new course (mock implementation)
   */
  createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Observable<Course> {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In real implementation, this would POST to API
    // For now, we simulate by returning the created course
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(newCourse);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Update an existing course (mock implementation)
   */
  updateCourse(courseId: string, updates: Partial<Course>): Observable<Course> {
    return this.courseService.getCourseById(courseId).pipe(
      map(course => {
        if (!course) {
          throw new Error('Course not found');
        }
        return {
          ...course,
          ...updates,
          updatedAt: new Date(),
        };
      })
    );
  }

  /**
   * Delete a course (mock implementation)
   */
  deleteCourse(_courseId: string): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 500);
    });
  }

  /**
   * Create a new lesson (mock implementation)
   */
  createLesson(
    lessonData: Omit<Lesson, 'id' | 'createdAt'>
  ): Observable<Lesson> {
    const newLesson: Lesson = {
      ...lessonData,
      id: `lesson-${Date.now()}`,
      createdAt: new Date(),
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(newLesson);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Update an existing lesson (mock implementation)
   */
  updateLesson(lessonId: string, updates: Partial<Lesson>): Observable<Lesson> {
    return this.courseService.getLessonById(lessonId).pipe(
      map(lesson => {
        if (!lesson) {
          throw new Error('Lesson not found');
        }
        return {
          ...lesson,
          ...updates,
        };
      })
    );
  }

  /**
   * Delete a lesson (mock implementation)
   */
  deleteLesson(_lessonId: string): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 500);
    });
  }

  /**
   * Get all lesson contents for a lesson
   */
  getLessonContents(lessonId: string): Observable<LessonContent[]> {
    return this.courseService.getLessonContents(lessonId);
  }

  /**
   * Create a new lesson content (mock implementation)
   */
  createLessonContent(
    contentData: Omit<LessonContent, 'id' | 'createdAt'>
  ): Observable<LessonContent> {
    const newContent: LessonContent = {
      ...contentData,
      id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(newContent);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Update an existing lesson content (mock implementation)
   */
  updateLessonContent(
    contentId: string,
    updates: Partial<LessonContent>
  ): Observable<LessonContent> {
    return new Observable(observer => {
      setTimeout(() => {
        // In real implementation, would fetch existing content and merge updates
        observer.next({ id: contentId, ...updates } as LessonContent);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Delete a lesson content (mock implementation)
   */
  deleteLessonContent(_contentId: string): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 500);
    });
  }

  /**
   * Reorder lesson contents (mock implementation)
   * Updates orderIndex for multiple contents
   */
  reorderLessonContents(
    _contents: { id: string; orderIndex: number }[]
  ): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 500);
    });
  }

  /**
   * Upload file (mock implementation)
   * Simulates file upload and returns a URL
   */
  uploadFile(file: File): Observable<string> {
    return new Observable(observer => {
      setTimeout(() => {
        // Mock URL - in real implementation would upload to server/cloud storage
        const mockUrl = `/assets/uploads/${Date.now()}-${file.name}`;
        observer.next(mockUrl);
        observer.complete();
      }, 1000);
    });
  }
}
