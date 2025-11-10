import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CourseService } from '../../../core/services/course.service';
import { Lesson, Module, Chapter } from '../../../models/course.model';
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
  module: Module | undefined;
  chapter: Chapter | undefined;
  progress: UserProgress | undefined;
  isAccessible = false;
  isCompleted = false;
  hasQuiz = false;
  quizPassed = false;
  nextLesson: Lesson | undefined;
  nextChapter: Chapter | undefined;
  isLastLessonInChapter = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const lessonId = params['lessonId'];
      if (lessonId) {
        this.loadLesson(lessonId);
      }
    });

    this.courseService.getUserProgress().subscribe(progress => {
      this.progress = progress;
      if (this.lesson) {
        this.isCompleted = progress.completedLessons.includes(this.lesson.id);

        // Check if quiz is passed
        if (this.lesson.quizId) {
          const quizScore = progress.quizScores.find(qs => qs.quizId === this.lesson!.quizId);
          this.quizPassed = quizScore?.passed || false;
        }
      }
    });
  }

  private loadLesson(lessonId: string): void {
    this.courseService.getLessonById(lessonId).subscribe(lesson => {
      this.lesson = lesson;
      if (lesson) {
        this.hasQuiz = !!lesson.quizId;
        this.loadChapterAndModule(lesson.chapterId);
        this.checkAccessibility(lessonId);
        this.loadNextLesson(lessonId);
        // Update last accessed lesson
        this.courseService.updateLastAccessedLesson(lessonId).subscribe();
      }
    });
  }

  private loadChapterAndModule(chapterId: string): void {
    this.courseService.getChapterById(chapterId).subscribe(chapter => {
      this.chapter = chapter;
      if (chapter) {
        this.courseService.getModuleById(chapter.moduleId).subscribe(module => {
          this.module = module;
        });
      }
    });
  }

  private checkAccessibility(lessonId: string): void {
    this.courseService.isLessonAccessible(lessonId).subscribe(accessible => {
      this.isAccessible = accessible;
      if (!accessible) {
        // Redirect to course detail if not accessible
        if (this.module) {
          this.router.navigate(['/courses', this.module.id]);
        }
      }
    });
  }

  private loadNextLesson(lessonId: string): void {
    this.courseService.getNextLesson(lessonId).subscribe(nextLesson => {
      this.nextLesson = nextLesson;

      // Check if we're at the last lesson of the chapter
      if (this.lesson && this.chapter) {
        const currentLessonIndex = this.chapter.lessons.findIndex(l => l.id === lessonId);
        this.isLastLessonInChapter = currentLessonIndex === this.chapter.lessons.length - 1;

        // If this is the last lesson, load the next chapter
        if (this.isLastLessonInChapter && this.module) {
          const nextChapterIndex =
            this.module.chapters.findIndex(c => c.id === this.chapter!.id) + 1;
          if (nextChapterIndex < this.module.chapters.length) {
            this.nextChapter = this.module.chapters[nextChapterIndex];
          }
        }
      }
    });
  }

  completeLesson(): void {
    if (this.lesson && !this.hasQuiz) {
      this.courseService.markLessonCompleted(this.lesson.id).subscribe(() => {
        this.isCompleted = true;
        if (this.nextLesson) {
          this.router.navigate(['/courses/lesson', this.nextLesson.id]);
        } else if (this.module) {
          this.router.navigate(['/courses', this.module.id]);
        }
      });
    } else if (this.lesson && this.hasQuiz && !this.quizPassed) {
      // Navigate to quiz only if not already passed
      this.router.navigate(['/courses/quiz', this.lesson.quizId], {
        queryParams: { lessonId: this.lesson.id },
      });
    }
  }

  goBack(): void {
    if (this.module) {
      this.router.navigate(['/courses', this.module.id]);
    } else {
      this.router.navigate(['/courses']);
    }
  }

  goToNextChapter(): void {
    if (this.nextChapter && this.nextChapter.lessons.length > 0) {
      const firstLesson = this.nextChapter.lessons[0];
      this.router.navigate(['/courses/lesson', firstLesson.id]);
    } else if (this.module) {
      // If no next chapter, go back to course overview
      this.router.navigate(['/courses', this.module.id]);
    }
  }

  formatContent(content: string): SafeHtml {
    // Simple markdown-like formatting
    let formatted = content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/^\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    formatted = '<p>' + formatted + '</p>';
    formatted = formatted.replace(/<\/li><br>/g, '</li>');
    formatted = formatted.replace(/<li>/g, '<ul><li>').replace(/<\/li>/g, '</li></ul>');

    return this.sanitizer.sanitize(1, formatted) || '';
  }
}
