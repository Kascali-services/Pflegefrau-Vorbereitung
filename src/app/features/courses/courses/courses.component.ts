import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../models/course.model';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterLink],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  courses: Course[] = [];

  ngOnInit(): void {
    this.courseService.getAllCourses().subscribe(courses => {
      this.courses = courses;
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
    const totalMinutes = Number(course.durationMinutes);
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
