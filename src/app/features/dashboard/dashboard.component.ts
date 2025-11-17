import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Course, Lesson } from '../../models/course.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { LessonEditorService } from '../../core/services/lesson-editor.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface CourseWithLessons {
  course: Course;
  lessons: Lesson[];
  expanded: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatExpansionModule, MatDialogModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private lessonEditorService = inject(LessonEditorService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

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
    this.router.navigate(['/verwaltung/inhaltverwaltung/lesson', lesson.id]);
  }

  createNewCourse(): void {
    this.router.navigate(['/verwaltung/inhaltverwaltung/course/create']);
  }

  createNewLesson(courseId: string): void {
    this.router.navigate(['/verwaltung/inhaltverwaltung/course', courseId, 'lesson', 'create']);
  }

  isCourseExpanded(courseId: string): boolean {
    return this.expandedCourseIds.has(courseId);
  }

  onEditCourse(course: Course): void {
    this.router.navigate(['/verwaltung/inhaltverwaltung/course', course.id, 'edit']);
  }

  onDeleteCourse(course: Course): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Kurs löschen',
        message: `Möchten Sie den Kurs "${course.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
        confirmText: 'Löschen',
        cancelText: 'Abbrechen',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lessonEditorService.deleteCourse(course.id).subscribe({
          next: () => {
            this.showSuccess('Kurs erfolgreich gelöscht');
            this.loadCourses(); // Reload the courses list
          },
          error: () => {
            this.showError('Fehler beim Löschen des Kurses');
          },
        });
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Schließen', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Schließen', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
