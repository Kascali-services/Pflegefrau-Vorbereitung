import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LessonEditorService } from '../../../core/services/lesson-editor.service';

@Component({
  selector: 'app-course-creator',
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
  templateUrl: './course-creator.component.html',
  styleUrl: './course-creator.component.scss',
})
export class CourseCreatorComponent {
  private router = inject(Router);
  private lessonEditorService = inject(LessonEditorService);
  private snackBar = inject(MatSnackBar);

  courseData = {
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    durationMinutes: 0,
    lessonsCount: 0,
    thumbnailUrl: '',
  };

  isSaving = false;

  createCourse(): void {
    if (!this.courseData.title.trim() || !this.courseData.description.trim()) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSaving = true;
    this.lessonEditorService.createCourse(this.courseData).subscribe({
      next: () => {
        this.showSuccess('Cours créé avec succès');
        this.isSaving = false;
        // Navigate back to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.showError('Erreur lors de la création du cours');
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
