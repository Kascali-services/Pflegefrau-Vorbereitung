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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Lesson, LessonContent } from '../../../models/course.model';
import { LessonEditorService } from '../../../core/services/lesson-editor.service';
import { CourseService } from '../../../core/services/course.service';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-lesson-editor',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    DragDropModule,
  ],
  templateUrl: './lesson-editor.component.html',
  styleUrl: './lesson-editor.component.scss',
})
export class LessonEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lessonEditorService = inject(LessonEditorService);
  private courseService = inject(CourseService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private dialogService = inject(DialogService);

  lessonId = '';
  lesson: Lesson | null = null;
  contents: LessonContent[] = [];
  isLoading = true;
  isSaving = false;

  // For adding new content
  showAddContent = false;
  newContentType: 'text' | 'video' | 'image' = 'text';
  newContentValue = '';

  ngOnInit(): void {
    this.lessonId = this.route.snapshot.paramMap.get('id') || '';
    if (this.lessonId) {
      this.loadLesson();
    } else {
      this.isLoading = false;
      this.showError('ID de leçon invalide');
      this.router.navigate(['/dashboard']);
    }
  }

  loadLesson(): void {
    this.isLoading = true;
    this.courseService.getLessonById(this.lessonId).subscribe({
      next: lesson => {
        if (lesson) {
          this.lesson = lesson;
          this.loadContents();
        } else {
          this.showError('Leçon non trouvée');
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.showError('Erreur lors du chargement de la leçon');
        this.isLoading = false;
      },
    });
  }

  loadContents(): void {
    this.lessonEditorService.getLessonContents(this.lessonId).subscribe({
      next: contents => {
        this.contents = [...contents];
        this.isLoading = false;
      },
      error: () => {
        this.showError('Erreur lors du chargement du contenu');
        this.isLoading = false;
      },
    });
  }

  onDrop(event: CdkDragDrop<LessonContent[]>): void {
    moveItemInArray(this.contents, event.previousIndex, event.currentIndex);
    
    // Update orderIndex for all items
    this.contents.forEach((content, index) => {
      content.orderIndex = index + 1;
    });

    // Save the new order
    this.saveOrder();
  }

  saveOrder(): void {
    const reorderData = this.contents.map(content => ({
      id: content.id,
      orderIndex: content.orderIndex,
    }));

    this.lessonEditorService.reorderLessonContents(reorderData).subscribe({
      next: () => {
        this.showSuccess('Ordre mis à jour avec succès');
      },
      error: () => {
        this.showError('Erreur lors de la mise à jour de l\'ordre');
      },
    });
  }

  editContent(content: LessonContent): void {
    // For text content, make it editable in place
    if (content.contentType === 'text') {
      // The contentValue is already bound via [(ngModel)], so changes are tracked
      // We'll save on blur or when save button is clicked
    }
  }

  saveContent(content: LessonContent): void {
    this.isSaving = true;
    this.lessonEditorService
      .updateLessonContent(content.id, {
        contentValue: content.contentValue,
      })
      .subscribe({
        next: () => {
          this.showSuccess('Contenu mis à jour avec succès');
          this.isSaving = false;
        },
        error: () => {
          this.showError('Erreur lors de la mise à jour du contenu');
          this.isSaving = false;
        },
      });
  }

  deleteContent(contentId: string): void {
    this.dialogService
      .openConfirmation({
        title: 'Inhalt löschen',
        message: 'Möchten Sie diesen Inhalt wirklich löschen?',
        confirmText: 'Löschen',
        cancelText: 'Abbrechen',
      })
      .subscribe(confirmed => {
        if (confirmed) {
          this.lessonEditorService.deleteLessonContent(contentId).subscribe({
            next: () => {
              this.contents = this.contents.filter(c => c.id !== contentId);
              // Reindex remaining contents
              this.contents.forEach((content, index) => {
                content.orderIndex = index + 1;
              });
              this.showSuccess('Contenu supprimé avec succès');
            },
            error: () => {
              this.showError('Erreur lors de la suppression du contenu');
            },
          });
        }
      });
  }

  onFileSelected(event: Event, content: LessonContent): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadFile(file, content);
    }
  }

  uploadFile(file: File, content: LessonContent): void {
    this.isSaving = true;
    this.lessonEditorService.uploadFile(file).subscribe({
      next: url => {
        content.contentValue = url;
        this.saveContent(content);
      },
      error: () => {
        this.showError('Erreur lors du téléchargement du fichier');
        this.isSaving = false;
      },
    });
  }

  toggleAddContent(): void {
    this.showAddContent = !this.showAddContent;
    if (!this.showAddContent) {
      this.newContentValue = '';
      this.newContentType = 'text';
    }
  }

  addNewContent(): void {
    if (!this.newContentValue.trim()) {
      this.showError('Veuillez saisir une valeur pour le contenu');
      return;
    }

    const newContent: Omit<LessonContent, 'id' | 'createdAt'> = {
      lessonId: this.lessonId,
      contentType: this.newContentType,
      contentValue: this.newContentValue,
      orderIndex: this.contents.length + 1,
    };

    this.isSaving = true;
    this.lessonEditorService.createLessonContent(newContent).subscribe({
      next: created => {
        this.contents.push(created);
        this.showSuccess('Contenu ajouté avec succès');
        this.toggleAddContent();
        this.isSaving = false;
      },
      error: () => {
        this.showError('Erreur lors de l\'ajout du contenu');
        this.isSaving = false;
      },
    });
  }

  onNewFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.isSaving = true;
      this.lessonEditorService.uploadFile(file).subscribe({
        next: url => {
          this.newContentValue = url;
          this.isSaving = false;
          this.showSuccess('Fichier téléchargé avec succès');
        },
        error: () => {
          this.showError('Erreur lors du téléchargement du fichier');
          this.isSaving = false;
        },
      });
    }
  }

  goBack(): void {
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

  getContentTypeIcon(type: string): string {
    switch (type) {
      case 'text':
        return 'article';
      case 'video':
        return 'play_circle';
      case 'image':
        return 'image';
      default:
        return 'description';
    }
  }
}
