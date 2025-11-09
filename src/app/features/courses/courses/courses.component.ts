import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Module } from '../../../models/course.model';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterLink],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  modules: Module[] = [];

  ngOnInit(): void {
    this.courseService.getAllModules().subscribe(modules => {
      this.modules = modules;
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
}
