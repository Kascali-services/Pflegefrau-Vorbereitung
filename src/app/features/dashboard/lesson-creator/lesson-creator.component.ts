import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Lesson } from '../../../models/course.model';
import { LessonEditorService } from '../../../core/services/lesson-editor.service';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-lesson-creator',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './lesson-creator.component.html',
  styleUrl: './lesson-creator.component.scss',
})
export class LessonCreatorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lessonEditorService = inject(LessonEditorService);
  private courseService = inject(CourseService);
  private snackBar = inject(MatSnackBar);

  courseId = '';
  courseName = '';
  lessonData = {
    title: '',
    description: '',
    type: 'text' as 'text' | 'video' | 'interactive',
    durationMinutes: 0,
    orderIndex: 1,
  };

  isSaving = false;

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    if (this.courseId) {
      this.loadCourse();
      this.loadNextOrderIndex();
    } else {
      this.showError('ID de cours invalide');
      this.router.navigate(['/dashboard']);
    }
  }

  loadCourse(): void {
    this.courseService.getCourseById(this.courseId).subscribe({
      next: course => {
        if (course) {
          this.courseName = course.title;
        }
      },
    });
  }

  loadNextOrderIndex(): void {
    this.courseService.getLessonsByCourseId(this.courseId).subscribe({
      next: lessons => {
        // Set orderIndex to be the next available number
        this.lessonData.orderIndex = lessons.length + 1;
      },
    });
  }

  createLesson(): void {
    if (!this.lessonData.title.trim()) {
      this.showError('Veuillez saisir un titre pour la leçon');
      return;
    }

    this.isSaving = true;
    const newLesson = {
      courseId: this.courseId,
      title: this.lessonData.title,
      description: this.lessonData.description,
      type: this.lessonData.type,
      durationMinutes: this.lessonData.durationMinutes,
      orderIndex: this.lessonData.orderIndex,
    };

    this.lessonEditorService.createLesson(newLesson).subscribe({
      next: (lesson: Lesson) => {
        this.showSuccess('Leçon créée avec succès');
        this.isSaving = false;
        // Navigate to the lesson editor to add content
        this.router.navigate(['/dashboard/lesson', lesson.id]);
      },
      error: () => {
        this.showError('Erreur lors de la création de la leçon');
        this.isSaving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
