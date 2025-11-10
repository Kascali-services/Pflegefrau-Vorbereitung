import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Module } from '../../../models/course.model';

@Component({
  selector: 'app-course-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  module: Module | undefined;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const moduleId = params['id'];
      this.courseService.getModuleById(moduleId).subscribe(module => {
        this.module = module;
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
        // Navigate to first lesson using router
        this.courseService
          .getModuleById(this.module.id)
          .subscribe(() => {
            // Using window.location for navigation to ensure proper routing
            window.location.href = `/courses/lesson/${firstLesson.id}`;
          });
      }
    }
  }
}
