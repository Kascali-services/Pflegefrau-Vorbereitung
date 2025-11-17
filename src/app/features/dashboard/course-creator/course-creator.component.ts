import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LessonEditorService } from '../../../core/services/lesson-editor.service';
import { CourseService } from '../../../core/services/course.service';

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
export class CourseCreatorComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private lessonEditorService = inject(LessonEditorService);
  private courseService = inject(CourseService);
  private snackBar = inject(MatSnackBar);

  isEditMode = false;
  courseId: string | null = null;

  courseData = {
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    durationMinutes: 0,
    lessonsCount: 0,
    thumbnailUrl: '',
  };

  thumbnailFile: File | null = null;
  thumbnailPreview: string | null = null;
  isSaving = false;

  ngOnInit(): void {
    // Check if we're in edit mode by checking the route
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    if (this.courseId) {
      this.isEditMode = true;
      this.loadCourse();
    }
  }

  loadCourse(): void {
    if (!this.courseId) return;

    this.courseService.getCourseById(this.courseId).subscribe({
      next: course => {
        if (course) {
          this.courseData = {
            title: course.title,
            description: course.description,
            level: course.level,
            durationMinutes: course.durationMinutes,
            lessonsCount: course.lessonsCount,
            thumbnailUrl: course.thumbnailUrl || '',
          };
          if (course.thumbnailUrl) {
            this.thumbnailPreview = course.thumbnailUrl;
          }
        }
      },
      error: () => {
        this.showError('Fehler beim Laden des Kurses');
        this.router.navigate(['/verwaltung/inhaltverwaltung']);
      },
    });
  }

  createCourse(): void {
    if (!this.courseData.title.trim() || !this.courseData.description.trim()) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSaving = true;

    if (this.isEditMode && this.courseId) {
      // Update existing course
      this.lessonEditorService.updateCourse(this.courseId, this.courseData, this.thumbnailFile || undefined).subscribe({
        next: () => {
          this.showSuccess('Kurs erfolgreich aktualisiert');
          this.isSaving = false;
          this.router.navigate(['/verwaltung/inhaltverwaltung']);
        },
        error: () => {
          this.showError('Fehler beim Aktualisieren des Kurses');
          this.isSaving = false;
        },
      });
    } else {
      // Create new course
      this.lessonEditorService.createCourse(this.courseData, this.thumbnailFile || undefined).subscribe({
        next: () => {
          this.showSuccess('Cours créé avec succès');
          this.isSaving = false;
          this.router.navigate(['/verwaltung/inhaltverwaltung']);
        },
        error: () => {
          this.showError('Erreur lors de la création du cours');
          this.isSaving = false;
        },
      });
    }
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.thumbnailFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.thumbnailPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.thumbnailFile);
    }
  }

  removeThumbnail(): void {
    this.thumbnailFile = null;
    this.thumbnailPreview = null;
    this.courseData.thumbnailUrl = '';
  }

  cancel(): void {
    this.router.navigate(['/verwaltung/inhaltverwaltung']);
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
