import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Course, Lesson } from '../../../models/course.model';

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
  course: Course | undefined;
  lessons: Lesson[] = [];
  hasProgress = false;
  isEnrolled = false;
  firstIncompleteLesson: Lesson | undefined;
  progressPercentage = 0;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const courseId = params['id'];

      // Get course details
      this.courseService.getCourseById(courseId).subscribe(course => {
        this.course = course;
        if (course) {
          // Get lessons for this course
          this.courseService.getLessonsByCourseId(courseId).subscribe(lessons => {
            this.lessons = lessons;
          });

          // Get course progress
          this.courseService.getCourseProgress(courseId).subscribe(progress => {
            this.hasProgress = progress.completedLessons > 0;
            this.progressPercentage = progress.progress;
          });

          // Check if user is enrolled
          this.courseService.isUserEnrolledInCourse(courseId).subscribe(isEnrolled => {
            this.isEnrolled = isEnrolled;
          });

          // Get first incomplete lesson
          this.courseService.getFirstIncompleteLessonForCourse(courseId).subscribe(lesson => {
            this.firstIncompleteLesson = lesson;
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

  getEstimatedDuration(course: Course): string {
    const totalMinutes = course.durationMinutes;
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

  startCourse(): void {
    if (this.course && this.lessons.length > 0) {
      const firstLesson = this.lessons[0];
      // Enroll user in course
      this.courseService.enrollUserInCourse(this.course.id).subscribe(() => {
        // Navigate to first lesson
        this.router.navigate(['/courses/lesson', firstLesson.id]);
      });
    }
  }

  continueCourse(): void {
    if (this.firstIncompleteLesson) {
      // Update last accessed date
      if (this.course) {
        this.courseService.updateCourseLastAccessed(this.course.id).subscribe();
      }
      // Navigate to first incomplete lesson
      this.router.navigate(['/courses/lesson', this.firstIncompleteLesson.id]);
    } else {
      // If no incomplete lesson, start from beginning
      this.startCourse();
    }
  }

  saveCourseForLater(): void {
    if (this.course) {
      // Enroll user but don't navigate
      this.courseService.enrollUserInCourse(this.course.id).subscribe(() => {
        // Could show a success message here
        this.isEnrolled = true;
      });
    }
  }
}
