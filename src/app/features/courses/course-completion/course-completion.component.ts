import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../models/course.model';

@Component({
  selector: 'app-course-completion',
  imports: [CommonModule],
  templateUrl: './course-completion.component.html',
  styleUrl: './course-completion.component.scss',
})
export class CourseCompletionComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  course: Course | undefined;
  showConfetti = true;

  ngOnInit(): void {
    // Get course ID from route params
    this.route.params.subscribe(params => {
      const courseId = params['courseId'];
      if (courseId) {
        this.loadCourse(courseId);
      }
    });

    // Auto redirect after 5 seconds
    setTimeout(() => {
      this.goToMyCourses();
    }, 5000);
  }

  private loadCourse(courseId: string): void {
    this.courseService.getCourseById(courseId).subscribe(course => {
      this.course = course;
    });
  }

  goToMyCourses(): void {
    this.router.navigate(['/my-courses']);
  }
}
