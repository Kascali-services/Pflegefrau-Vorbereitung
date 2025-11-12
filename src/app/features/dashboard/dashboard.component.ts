import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Course, Lesson } from '../../models/course.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface CourseWithLessons {
  course: Course;
  lessons: Lesson[];
  expanded: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatExpansionModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  coursesWithLessons$!: Observable<CourseWithLessons[]>;
  expandedCourseIds: Set<string> = new Set<string>();

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.coursesWithLessons$ = this.dashboardService.getAllCoursesWithLessons().pipe(
      map(courses =>
        courses.map(({ course }) => ({
          course,
          lessons: [],
          expanded: false,
        }))
      )
    );
  }

  toggleCourse(courseId: string): void {
    if (this.expandedCourseIds.has(courseId)) {
      this.expandedCourseIds.delete(courseId);
    } else {
      this.expandedCourseIds.add(courseId);
    }

    // Reload with lessons for expanded courses
    this.coursesWithLessons$ = this.dashboardService.getAllCoursesWithLessons().pipe(
      map(courses => {
        const observables = courses.map(({ course }) => {
          if (this.expandedCourseIds.has(course.id)) {
            return this.dashboardService.getLessonsByCourseId(course.id).pipe(
              map(lessons => ({
                course,
                lessons,
                expanded: true,
              }))
            );
          } else {
            return new Observable<CourseWithLessons>(observer => {
              observer.next({
                course,
                lessons: [],
                expanded: false,
              });
              observer.complete();
            });
          }
        });

        return combineLatest(observables);
      }),
      map(observable => {
        let result: CourseWithLessons[] = [];
        observable.subscribe(data => {
          result = data;
        });
        return result;
      })
    );

    // Re-subscribe to get the actual data
    this.loadCoursesWithExpanded();
  }

  private loadCoursesWithExpanded(): void {
    this.dashboardService.getAllCoursesWithLessons().subscribe(courses => {
      const observables = courses.map(({ course }) => {
        if (this.expandedCourseIds.has(course.id)) {
          return this.dashboardService.getLessonsByCourseId(course.id).pipe(
            map(lessons => ({
              course,
              lessons,
              expanded: true,
            }))
          );
        } else {
          return new Observable<CourseWithLessons>(observer => {
            observer.next({
              course,
              lessons: [],
              expanded: false,
            });
            observer.complete();
          });
        }
      });

      this.coursesWithLessons$ = combineLatest(observables);
    });
  }

  onEditLesson(lesson: Lesson): void {
    this.router.navigate(['/dashboard/lesson', lesson.id]);
  }

  isCourseExpanded(courseId: string): boolean {
    return this.expandedCourseIds.has(courseId);
  }
}
