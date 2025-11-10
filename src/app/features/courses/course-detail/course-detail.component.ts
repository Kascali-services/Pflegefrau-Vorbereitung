import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Module, Lesson } from '../../../models/course.model';

@Component({
  selector: 'app-course-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  module: Module | undefined;
  hasProgress = false;
  isEnrolled = false;
  lastAccessedLesson: Lesson | undefined;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const moduleId = params['id'];
      this.courseService.getModuleById(moduleId).subscribe(module => {
        this.module = module;
        if (module) {
          // Check if user has progress in this course
          this.courseService.hasUserProgressInCourse(moduleId).subscribe(hasProgress => {
            this.hasProgress = hasProgress;
          });

          // Check if user is enrolled
          this.courseService.isUserEnrolledInCourse(moduleId).subscribe(isEnrolled => {
            this.isEnrolled = isEnrolled;
          });

          // Get last accessed lesson
          this.courseService.getLastAccessedLessonForModule(moduleId).subscribe(lesson => {
            this.lastAccessedLesson = lesson;
          });
        }
      });
    });
  }

  getLevelLabel(level: string): string {
    const levelMap: Record<string, string> = {
      beginner: 'Anfänger',
      intermediate: 'Fortgeschritten',
      advanced: 'Experte',
    };
    return levelMap[level] || level;
  }

  getEstimatedDuration(module: Module): string {
    const totalMinutes = module.chapters.reduce((sum, chapter) => sum + chapter.estimatedTime, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours} Std. ${minutes} Min.`;
    } else if (hours > 0) {
      return `${hours} Std.`;
    } else {
      return `${minutes} Min.`;
    }
  }

  getTotalLessons(module: Module): number {
    return module.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  }

  startCourse(): void {
    if (this.module && this.module.chapters.length > 0) {
      const firstChapter = this.module.chapters[0];
      if (firstChapter.lessons.length > 0) {
        const firstLesson = firstChapter.lessons[0];
        // Enroll user in course
        this.courseService.enrollUserInCourse(this.module.id).subscribe(() => {
          // Navigate to first lesson
          this.router.navigate(['/courses/lesson', firstLesson.id]);
        });
      }
    }
  }

  continueCourse(): void {
    if (this.lastAccessedLesson) {
      // Update last accessed date
      if (this.module) {
        this.courseService.updateCourseLastAccessed(this.module.id).subscribe();
      }
      // Navigate to last accessed lesson
      this.router.navigate(['/courses/lesson', this.lastAccessedLesson.id]);
    } else {
      // If no last accessed lesson, start from beginning
      this.startCourse();
    }
  }

  saveCourseForLater(): void {
    if (this.module) {
      // Enroll user but don't navigate
      this.courseService.enrollUserInCourse(this.module.id).subscribe(() => {
        // Could show a success message here
        this.isEnrolled = true;
      });
    }
  }
}
