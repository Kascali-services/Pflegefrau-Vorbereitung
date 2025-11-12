import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Lesson, LessonContent } from '../../../models/course.model';
import { NotificationService } from '../../../core/services/notification.service';

export interface LessonEditorData {
  lesson: Lesson;
  contents: LessonContent[];
}

@Component({
  selector: 'app-lesson-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './lesson-editor-dialog.component.html',
  styleUrl: './lesson-editor-dialog.component.scss',
})
export class LessonEditorDialogComponent implements OnInit {
  data: LessonEditorData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<LessonEditorDialogComponent>);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  lessonForm!: FormGroup;
  lessonContents: LessonContent[] = [];

  ngOnInit(): void {
    this.initializeForm();
    this.lessonContents = [...this.data.contents];
  }

  private initializeForm(): void {
    const lesson = this.data.lesson;
    this.lessonForm = this.fb.group({
      title: [lesson.title, [Validators.required, Validators.maxLength(255)]],
      description: [lesson.description || '', []],
      type: [lesson.type, [Validators.required]],
      durationMinutes: [lesson.durationMinutes, [Validators.required, Validators.min(0)]],
    });
  }

  onDeleteContent(content: LessonContent, index: number): void {
    const message = `Êtes-vous sûr de vouloir supprimer ce contenu: "${content.contentType}" ?`;
    this.notificationService.showConfirmation('Confirmer la suppression', message).subscribe({
      next: confirmed => {
        if (confirmed) {
          this.lessonContents.splice(index, 1);
          this.notificationService.showSuccess('Contenu supprimé avec succès');
        }
      },
    });
  }

  onSubmit(): void {
    if (this.lessonForm.valid) {
      const result = {
        lesson: {
          ...this.data.lesson,
          ...this.lessonForm.value,
        },
        contents: this.lessonContents,
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getContentIcon(contentType: string): string {
    switch (contentType) {
      case 'text':
        return 'article';
      case 'video':
        return 'play_circle';
      case 'image':
        return 'image';
      default:
        return 'insert_drive_file';
    }
  }
}
