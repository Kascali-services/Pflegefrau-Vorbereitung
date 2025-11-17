import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Course, Lesson, LessonContent } from '../../models/course.model';
import { CourseService } from './course.service';
import { environment } from '../../../environments/environment';
import {
  CreateLessonRequest,
  UpdateLessonRequest,
  CreateLessonContentRequest,
  UpdateLessonContentRequest,
  CourseResponse,
  LessonResponse,
  LessonContentResponse,
} from '../interfaces/learning-api.interface';

/**
 * LessonEditorService - Manages lesson editing operations
 * Provides CRUD operations for courses, lessons, and lesson contents
 * Integrated with Learning Service backend via API gateway
 */
@Injectable({
  providedIn: 'root',
})
export class LessonEditorService {
  private http = inject(HttpClient);
  private courseService = inject(CourseService);
  private apiUrl = `${environment.apiUrl}/api`;

  /**
   * Create a new course
   */
  createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>, thumbnailFile?: File): Observable<Course> {
    // Use FormData for multipart upload when thumbnail file is provided
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('level', courseData.level);
    formData.append('durationMinutes', courseData.durationMinutes.toString());
    
    // Add thumbnail file if provided (optional)
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    return this.http.post<CourseResponse>(`${this.apiUrl}/courses`, formData).pipe(
      map(response => ({
        id: response.id,
        title: response.title,
        description: response.description,
        thumbnailUrl: response.thumbnailUrl,
        level: response.level,
        durationMinutes: response.durationMinutes,
        lessonsCount: response.lessonsCount,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      })),
      catchError(error => {
        console.error('Error creating course:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing course
   */
  updateCourse(courseId: string, updates: Partial<Course>, thumbnailFile?: File): Observable<Course> {
    // Use FormData for multipart upload when thumbnail file is provided
    const formData = new FormData();
    
    if (updates.title !== undefined) {
      formData.append('title', updates.title);
    }
    if (updates.description !== undefined) {
      formData.append('description', updates.description);
    }
    if (updates.level !== undefined) {
      formData.append('level', updates.level);
    }
    if (updates.durationMinutes !== undefined) {
      formData.append('durationMinutes', updates.durationMinutes.toString());
    }
    
    // Add thumbnail file if provided (optional)
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    return this.http.put<CourseResponse>(`${this.apiUrl}/courses/${courseId}`, formData).pipe(
      map(response => ({
        id: response.id,
        title: response.title,
        description: response.description,
        thumbnailUrl: response.thumbnailUrl,
        level: response.level,
        durationMinutes: response.durationMinutes,
        lessonsCount: response.lessonsCount,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      })),
      catchError(error => {
        console.error('Error updating course:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a course
   */
  deleteCourse(courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/courses/${courseId}`).pipe(
      catchError(error => {
        console.error('Error deleting course:', error);
        throw error;
      })
    );
  }

  /**
   * Create a new lesson
   */
  createLesson(lessonData: Omit<Lesson, 'id' | 'createdAt'>): Observable<Lesson> {
    const request: CreateLessonRequest = {
      title: lessonData.title,
      description: lessonData.description,
      durationMinutes: lessonData.durationMinutes,
      orderIndex: lessonData.orderIndex,
    };

    return this.http
      .post<LessonResponse>(`${this.apiUrl}/courses/${lessonData.courseId}/lessons`, request)
      .pipe(
        map(response => ({
          id: response.id,
          courseId: response.courseId,
          title: response.title,
          description: response.description,
          durationMinutes: response.durationMinutes,
          orderIndex: response.orderIndex,
          createdAt: new Date(response.createdAt),
        })),
        catchError(error => {
          console.error('Error creating lesson:', error);
          throw error;
        })
      );
  }

  /**
   * Update an existing lesson
   */
  updateLesson(lessonId: string, updates: Partial<Lesson>): Observable<Lesson> {
    const request: UpdateLessonRequest = {
      title: updates.title,
      description: updates.description,
      durationMinutes: updates.durationMinutes,
      orderIndex: updates.orderIndex,
    };

    return this.http.put<LessonResponse>(`${this.apiUrl}/lessons/${lessonId}`, request).pipe(
      map(response => ({
        id: response.id,
        courseId: response.courseId,
        title: response.title,
        description: response.description,
        durationMinutes: response.durationMinutes,
        orderIndex: response.orderIndex,
        createdAt: new Date(response.createdAt),
      })),
      catchError(error => {
        console.error('Error updating lesson:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a lesson
   */
  deleteLesson(lessonId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/lessons/${lessonId}`).pipe(
      catchError(error => {
        console.error('Error deleting lesson:', error);
        throw error;
      })
    );
  }

  /**
   * Get all lesson contents for a lesson
   */
  getLessonContents(lessonId: string): Observable<LessonContent[]> {
    return this.courseService.getLessonContents(lessonId);
  }

  /**
   * Create a new lesson content
   */
  createLessonContent(contentData: Omit<LessonContent, 'id' | 'createdAt'>): Observable<LessonContent> {
    const request: CreateLessonContentRequest = {
      contentType: contentData.contentType,
      contentValue: contentData.contentValue,
      orderIndex: contentData.orderIndex,
    };

    return this.http
      .post<LessonContentResponse>(`${this.apiUrl}/lessons/${contentData.lessonId}/contents`, request)
      .pipe(
        map(response => ({
          id: response.id,
          lessonId: response.lessonId,
          contentType: response.contentType,
          contentValue: response.contentValue,
          orderIndex: response.orderIndex,
          createdAt: new Date(response.createdAt),
        })),
        catchError(error => {
          console.error('Error creating lesson content:', error);
          throw error;
        })
      );
  }

  /**
   * Update an existing lesson content
   */
  updateLessonContent(contentId: string, updates: Partial<LessonContent>): Observable<LessonContent> {
    const request: UpdateLessonContentRequest = {
      contentValue: updates.contentValue,
      orderIndex: updates.orderIndex,
    };

    return this.http.put<LessonContentResponse>(`${this.apiUrl}/contents/${contentId}`, request).pipe(
      map(response => ({
        id: response.id,
        lessonId: response.lessonId,
        contentType: response.contentType,
        contentValue: response.contentValue,
        orderIndex: response.orderIndex,
        createdAt: new Date(response.createdAt),
      })),
      catchError(error => {
        console.error('Error updating lesson content:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a lesson content
   */
  deleteLessonContent(contentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contents/${contentId}`).pipe(
      catchError(error => {
        console.error('Error deleting lesson content:', error);
        throw error;
      })
    );
  }

  /**
   * Reorder lesson contents
   * Updates orderIndex for multiple contents
   */
  reorderLessonContents(contents: { id: string; orderIndex: number }[]): Observable<void> {
    // Update each content's order one by one
    // In a real implementation, the backend might have a batch update endpoint
    const updates = contents.map(content =>
      this.updateLessonContent(content.id, { orderIndex: content.orderIndex })
    );

    return new Observable(observer => {
      Promise.all(updates.map(obs => obs.toPromise()))
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Upload file (for images/videos)
   * Uses the Content Management Service via the gateway
   */
  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Determine file type
    const type = file.type.startsWith('image/') ? 'image' : 'video';
    formData.append('type', type);

    return this.http
      .post<{ url: string }>(`${this.apiUrl}/media/upload`, formData)
      .pipe(
        map(response => response.url),
        catchError(error => {
          console.error('Error uploading file:', error);
          throw error;
        })
      );
  }
}
