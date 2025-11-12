import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  settingsForm: FormGroup;
  currentUser: User | null = null;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor() {
    this.settingsForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.userService.getCurrentUser().subscribe({
      next: user => {
        if (user) {
          this.currentUser = user;
          this.settingsForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
          });
          this.previewUrl = user.avatarUrl || null;
        } else {
          // If no user is logged in, redirect to login
          this.router.navigate(['/auth/login']);
        }
      },
      error: () => {
        this.errorMessage = 'Fehler beim Laden der Benutzerdaten';
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Bitte wählen Sie eine Bilddatei aus';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Die Datei ist zu groß. Maximale Größe: 5MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      this.markFormGroupTouched(this.settingsForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { firstName, lastName } = this.settingsForm.value;

    // First upload avatar if a new file was selected
    if (this.selectedFile) {
      this.userService.uploadAvatar(this.selectedFile).subscribe({
        next: avatarUrl => {
          // Then update profile with new data including avatar URL
          this.updateProfile(firstName, lastName, avatarUrl);
        },
        error: error => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Fehler beim Hochladen des Profilbildes';
        },
      });
    } else {
      // Update profile without changing avatar
      this.updateProfile(firstName, lastName, this.currentUser?.avatarUrl);
    }
  }

  private updateProfile(
    firstName: string,
    lastName: string,
    avatarUrl: string | undefined
  ): void {
    if (!this.currentUser) {
      this.isLoading = false;
      this.errorMessage = 'Kein Benutzer gefunden';
      return;
    }

    const updatedUser: User = {
      ...this.currentUser,
      firstName,
      lastName,
      avatarUrl,
    };

    this.userService.updateProfile(updatedUser).subscribe({
      next: user => {
        this.isLoading = false;
        this.successMessage = 'Profil erfolgreich aktualisiert';
        this.currentUser = user;
        this.selectedFile = null;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Fehler beim Aktualisieren des Profils';
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get firstName() {
    return this.settingsForm.get('firstName');
  }

  get lastName() {
    return this.settingsForm.get('lastName');
  }

  get email() {
    return this.settingsForm.get('email');
  }
}
