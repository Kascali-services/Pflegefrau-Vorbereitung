import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../../shared/components/dialogs/confirmation-dialog.component';
import { InfoDialogComponent } from '../../shared/components/dialogs/info-dialog.component';

/**
 * NotificationService - Provides user feedback through modals and snackbars
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  /**
   * Show a simple information message using snackbar
   */
  showInfo(message: string, duration = 3000): void {
    this.snackBar.open(message, 'OK', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  /**
   * Show a success message using snackbar
   */
  showSuccess(message: string, duration = 3000): void {
    this.snackBar.open(message, 'OK', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  /**
   * Show an error message using snackbar
   */
  showError(message: string, duration = 5000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  /**
   * Show a confirmation dialog
   */
  showConfirmation(title: string, message: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { title, message },
    });

    return dialogRef.afterClosed();
  }

  /**
   * Show an information dialog
   */
  showInfoDialog(title: string, message: string): Observable<void> {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '400px',
      data: { title, message },
    });

    return dialogRef.afterClosed();
  }
}
