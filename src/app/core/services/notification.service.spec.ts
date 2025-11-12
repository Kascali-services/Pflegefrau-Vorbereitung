import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';
import { of } from 'rxjs';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show info message', () => {
    service.showInfo('Test message');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'OK', jasmine.any(Object));
  });

  it('should show success message', () => {
    service.showSuccess('Success message');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Success message', 'OK', jasmine.any(Object));
  });

  it('should show error message', () => {
    service.showError('Error message');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Error message',
      'Fermer',
      jasmine.any(Object)
    );
  });

  it('should show confirmation dialog', () => {
    const mockDialogRef = { afterClosed: () => of(true) };
    mockDialog.open.and.returnValue(mockDialogRef as MatDialogRef<unknown>);

    service.showConfirmation('Title', 'Message');
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should show info dialog', () => {
    const mockDialogRef = { afterClosed: () => of(undefined) };
    mockDialog.open.and.returnValue(mockDialogRef as MatDialogRef<unknown>);

    service.showInfoDialog('Title', 'Message');
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
