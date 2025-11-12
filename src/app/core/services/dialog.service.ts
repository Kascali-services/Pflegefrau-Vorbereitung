import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialog = inject(MatDialog);

  /**
   * Opens a confirmation dialog
   * @param data The dialog configuration
   * @returns Observable that emits true if confirmed, false if cancelled
   */
  openConfirmation(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: data.title,
        message: data.message,
        confirmText: data.confirmText || 'Confirmer',
        cancelText: data.cancelText || 'Annuler',
      },
    });

    return dialogRef.afterClosed();
  }
}
