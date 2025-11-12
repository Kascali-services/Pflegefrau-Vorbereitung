import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { SettingsComponent } from './settings.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../models/user.model';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let currentUserSubject: BehaviorSubject<User | null>;

  const mockUser: User = {
    id: 'user-001',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'student',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(mockUser);

    mockUserService = jasmine.createSpyObj('UserService', [
      'getCurrentUser',
      'updateProfile',
      'uploadAvatar',
    ]);
    mockUserService.getCurrentUser.and.returnValue(currentUserSubject.asObservable());
    mockUserService.updateProfile.and.returnValue(of(mockUser));
    mockUserService.uploadAvatar.and.returnValue(of('https://example.com/new-avatar.jpg'));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SettingsComponent, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', () => {
    expect(component.currentUser).toEqual(mockUser);
    expect(component.settingsForm.value.firstName).toBe('John');
    expect(component.settingsForm.value.lastName).toBe('Doe');
    expect(component.settingsForm.get('email')?.value).toBe('test@example.com');
    expect(component.previewUrl).toBe('https://example.com/avatar.jpg');
  });

  it('should redirect to login if no user is logged in', () => {
    currentUserSubject.next(null);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should validate form fields', () => {
    const form = component.settingsForm;

    // Test required validation
    form.patchValue({ firstName: '', lastName: '', email: '' });
    expect(form.invalid).toBe(true);

    // Test min length validation
    form.patchValue({ firstName: 'J', lastName: 'D', email: 'test@example.com' });
    expect(form.get('firstName')?.hasError('minlength')).toBe(true);
    expect(form.get('lastName')?.hasError('minlength')).toBe(true);

    // Test valid form
    form.patchValue({ firstName: 'John', lastName: 'Doe', email: 'test@example.com' });
    expect(form.valid).toBe(true);
  });

  it('should handle file selection', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = {
      target: {
        files: [file],
      },
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(file);
  });

  it('should reject non-image files', () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    const event = {
      target: {
        files: [file],
      },
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.selectedFile).toBeNull();
    expect(component.errorMessage).toBe('Bitte wählen Sie eine Bilddatei aus');
  });

  it('should reject files larger than 5MB', () => {
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    const event = {
      target: {
        files: [largeFile],
      },
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.selectedFile).toBeNull();
    expect(component.errorMessage).toBe('Die Datei ist zu groß. Maximale Größe: 5MB');
  });

  it('should update profile without avatar change', done => {
    component.settingsForm.patchValue({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'test@example.com',
    });

    component.onSubmit();

    setTimeout(() => {
      expect(mockUserService.updateProfile).toHaveBeenCalled();
      expect(component.successMessage).toBe('Profil erfolgreich aktualisiert');
      expect(component.isLoading).toBe(false);
      done();
    }, 100);
  });

  it('should update profile with avatar change', done => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    component.selectedFile = file;
    component.settingsForm.patchValue({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'test@example.com',
    });

    component.onSubmit();

    setTimeout(() => {
      expect(mockUserService.uploadAvatar).toHaveBeenCalledWith(file);
      expect(mockUserService.updateProfile).toHaveBeenCalled();
      expect(component.successMessage).toBe('Profil erfolgreich aktualisiert');
      expect(component.isLoading).toBe(false);
      done();
    }, 100);
  });

  it('should mark form as touched on invalid submit', () => {
    component.settingsForm.patchValue({ firstName: '', lastName: '', email: '' });

    component.onSubmit();

    expect(component.settingsForm.get('firstName')?.touched).toBe(true);
    expect(component.settingsForm.get('lastName')?.touched).toBe(true);
  });

  it('should clear success message after 3 seconds', done => {
    component.settingsForm.patchValue({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'test@example.com',
    });

    component.onSubmit();

    setTimeout(() => {
      expect(component.successMessage).toBe('Profil erfolgreich aktualisiert');
    }, 100);

    setTimeout(() => {
      expect(component.successMessage).toBe('');
      done();
    }, 3200);
  });
});
