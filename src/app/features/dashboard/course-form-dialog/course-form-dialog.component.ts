import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Course } from '../../../models/course.model';

export interface CourseFormData {
  course?: Course;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-course-form-dialog',
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
  ],
  templateUrl: './course-form-dialog.component.html',
  styleUrl: './course-form-dialog.component.scss',
})
export class CourseFormDialogComponent implements OnInit {
  data: CourseFormData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<CourseFormDialogComponent>);
  private fb = inject(FormBuilder);

  courseForm!: FormGroup;
  selectedFile: File | null = null;
  thumbnailPreview: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const course = this.data.course;
    this.courseForm = this.fb.group({
      title: [course?.title || '', [Validators.required, Validators.maxLength(255)]],
      description: [course?.description || '', [Validators.required]],
      level: [course?.level || 'beginner', [Validators.required]],
      durationMinutes: [course?.durationMinutes || 0, [Validators.required, Validators.min(0)]],
    });

    if (course?.thumbnailUrl) {
      this.thumbnailPreview = course.thumbnailUrl;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.thumbnailPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeThumbnail(): void {
    this.selectedFile = null;
    this.thumbnailPreview = null;
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      const formData = this.courseForm.value;
      const result = {
        ...formData,
        thumbnailFile: this.selectedFile,
        thumbnailPreview: this.thumbnailPreview,
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  get isCreateMode(): boolean {
    return this.data.mode === 'create';
  }
}
