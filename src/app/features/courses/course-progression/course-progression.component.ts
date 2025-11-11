import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CourseService } from '../../../core/services/course.service';
import { Lesson, Course, Quiz } from '../../../models/course.model';
import { UserProgress } from '../../../models/progress.model';

@Component({
  selector: 'app-course-progression',
  imports: [CommonModule],
  templateUrl: './course-progression.component.html',
  styleUrl: './course-progression.component.scss',
})
export class CourseProgressionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private sanitizer = inject(DomSanitizer);

  lesson: Lesson | undefined;
  course: Course | undefined;
  quiz: Quiz | undefined;
  lessonContent = '';
  lessonProgress: UserProgress | undefined;
  isAccessible = false;
  isCompleted = false;
  hasQuiz = false;
  quizPassed = false;
  nextLesson: Lesson | undefined;
  previousLesson: Lesson | undefined;
  isPreviousLessonCompleted = false;
  isNextLessonAccessible = false;
  lessonIndex = 0;
  totalLessons = 0;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const lessonId = params['lessonId'];
      if (lessonId) {
        this.loadLesson(lessonId);
      }
    });
  }

  private loadLesson(lessonId: string): void {
    this.courseService.getLessonById(lessonId).subscribe(lesson => {
      this.lesson = lesson;
      if (lesson) {
        // Load course
        this.courseService.getCourseById(lesson.courseId).subscribe(course => {
          this.course = course;
        });

        // Load lesson content
        this.courseService.getLessonContent(lessonId).subscribe(content => {
          this.lessonContent = content;
        });

        // Check if lesson has a quiz
        this.courseService.getQuizByLessonId(lessonId).subscribe(quiz => {
          this.quiz = quiz;
          this.hasQuiz = !!quiz;
        });

        // Get lesson progress
        this.courseService.getLessonProgress(lessonId).subscribe(progress => {
          this.lessonProgress = progress;
          this.isCompleted = progress?.isCompleted || false;
          this.quizPassed = progress?.isCompleted || false;
        });

        // Get all lessons for the course to determine position
        this.courseService.getLessonsByCourseId(lesson.courseId).subscribe(lessons => {
          this.totalLessons = lessons.length;
          this.lessonIndex = lessons.findIndex(l => l.id === lessonId) + 1;
        });

        // Check accessibility
        this.checkAccessibility(lessonId);
        
        // Load next and previous lessons
        this.loadNextLesson(lessonId);
        this.loadPreviousLesson(lessonId);
        
        // Update last accessed lesson
        this.courseService.updateLastAccessedLesson(lessonId).subscribe();
        
        // Update course last accessed
        this.courseService.updateCourseLastAccessed(lesson.courseId).subscribe();
      }
    });
  }

  private checkAccessibility(lessonId: string): void {
    this.courseService.isLessonAccessible(lessonId).subscribe(accessible => {
      this.isAccessible = accessible;
      if (!accessible && this.course) {
        // Redirect to course detail if not accessible
        this.router.navigate(['/courses', this.course.id]);
      }
    });
  }

  private loadNextLesson(lessonId: string): void {
    this.courseService.getNextLesson(lessonId).subscribe(nextLesson => {
      this.nextLesson = nextLesson;

      // Check if next lesson is accessible
      if (nextLesson) {
        this.courseService.isLessonAccessible(nextLesson.id).subscribe(accessible => {
          this.isNextLessonAccessible = accessible;
        });
      }
    });
  }

  private loadPreviousLesson(lessonId: string): void {
    this.courseService.getPreviousLesson(lessonId).subscribe(previousLesson => {
      this.previousLesson = previousLesson;

      // Check if previous lesson exists (user can navigate back to completed lessons)
      if (previousLesson) {
        this.courseService.getLessonProgress(previousLesson.id).subscribe(progress => {
          this.isPreviousLessonCompleted = progress?.isCompleted || false;
        });
      }
    });
  }

  completeLesson(): void {
    if (!this.lesson) return;

    if (!this.hasQuiz) {
      // Lesson without quiz - mark as completed
      this.courseService.markLessonCompleted(this.lesson.id).subscribe(() => {
        this.isCompleted = true;
        // Check if this is the last lesson
        if (!this.nextLesson && this.course) {
          // Last lesson - go to completion celebration
          this.router.navigate(['/courses/completion', this.course.id]);
        } else if (this.nextLesson) {
          // More lessons - go to next lesson
          this.router.navigate(['/courses/lesson', this.nextLesson.id]);
        } else if (this.course) {
          // Fallback - go back to course
          this.router.navigate(['/courses', this.course.id]);
        }
      });
    } else if (!this.quizPassed) {
      // Lesson with quiz and not yet passed - go to quiz
      if (this.quiz) {
        this.router.navigate(['/courses/quiz', this.quiz.id], {
          queryParams: { lessonId: this.lesson.id },
        });
      }
    } else {
      // Quiz already passed - navigate
      if (!this.nextLesson && this.course) {
        // Last lesson - go to completion celebration
        this.router.navigate(['/courses/completion', this.course.id]);
      } else if (this.nextLesson) {
        // More lessons - go to next lesson
        this.router.navigate(['/courses/lesson', this.nextLesson.id]);
      } else if (this.course) {
        // Fallback - go back to course
        this.router.navigate(['/courses', this.course.id]);
      }
    }
  }

  goBack(): void {
    if (this.course) {
      this.router.navigate(['/courses', this.course.id]);
    } else {
      this.router.navigate(['/courses']);
    }
  }

  goToPreviousLesson(): void {
    if (this.previousLesson) {
      this.router.navigate(['/courses/lesson', this.previousLesson.id]);
    }
  }

  goToNextLesson(): void {
    if (this.nextLesson && this.isNextLessonAccessible) {
      this.router.navigate(['/courses/lesson', this.nextLesson.id]);
    }
  }

  formatContent(content: string): SafeHtml {
    // Simple markdown-like formatting
    let formatted = content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    formatted = '<p>' + formatted + '</p>';
    formatted = formatted.replace(/<\/li><br>/g, '</li>');
    
    // Fix list formatting
    let inList = false;
    formatted = formatted.replace(/<li>/g, () => {
      if (!inList) {
        inList = true;
        return '<ul><li>';
      }
      return '<li>';
    });
    formatted = formatted.replace(/<\/li>/g, () => {
      return '</li>';
    });
    formatted = formatted.replace(/<\/li>(?!<li>)/g, '</li></ul>');

    return this.sanitizer.sanitize(1, formatted) || '';
  }

  getLessonTypeIcon(): string {
    if (!this.lesson) return '📄';
    switch (this.lesson.type) {
      case 'video':
        return '🎥';
      case 'interactive':
        return '💻';
      default:
        return '📄';
    }
  }
}
