import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatChipsModule,
    MatIconModule,
    DragDropModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  userForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  specialtiesInput = '';
  specialtiesList: string[] = [];

  constructor() {
    this.userForm = this.fb.group({
      userType: ['user', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      // Regular user fields
      empfehlungsnummer: ['', [Validators.maxLength(8)]],
      // Team member fields
      role: ['content_manager'],
      bio: ['', [Validators.required, Validators.minLength(10)]],
    });

    // Watch for user type changes to adjust form validation
    this.userForm.get('userType')?.valueChanges.subscribe(userType => {
      this.updateFormValidation(userType);
    });
  }

  updateFormValidation(userType: string): void {
    const empfehlungsnummerControl = this.userForm.get('empfehlungsnummer');
    const roleControl = this.userForm.get('role');

    if (userType === 'user') {
      // Regular user: empfehlungsnummer is optional
      empfehlungsnummerControl?.setValidators([Validators.maxLength(8)]);
      roleControl?.clearValidators();
    } else {
      // Team member: role is required, empfehlungsnummer not applicable
      empfehlungsnummerControl?.clearValidators();
      roleControl?.setValidators([Validators.required]);
    }

    empfehlungsnummerControl?.updateValueAndValidity();
    roleControl?.updateValueAndValidity();

    // Clear specialty list when changing user type
    this.specialtiesList = [];
  }

  addSpecialty(): void {
    const specialty = this.specialtiesInput.trim();
    if (specialty && !this.specialtiesList.includes(specialty)) {
      this.specialtiesList.push(specialty);
      this.specialtiesInput = '';
    }
  }

  removeSpecialty(specialty: string): void {
    const index = this.specialtiesList.indexOf(specialty);
    if (index >= 0) {
      this.specialtiesList.splice(index, 1);
    }
  }

  onSpecialtyDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.specialtiesList, event.previousIndex, event.currentIndex);
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }
    if (this.specialtiesList.length === 0) {
      this.errorMessage = 'Mindestens eine Spezialisierung ist erforderlich.';
      return;
    }
    const { password, confirmPassword } = this.userForm.value;
    if (password !== confirmPassword) {
      this.errorMessage = 'Die Passwörter stimmen nicht überein';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { userType, email, firstName, lastName, empfehlungsnummer, role, bio } =
      this.userForm.value;

    if (userType === 'user') {
      // Create regular user
      this.authService.register(email, password, firstName, lastName, empfehlungsnummer).subscribe({
        next: user => {
          this.isLoading = false;
          this.successMessage = `Benutzer ${user.firstName} ${user.lastName} wurde erfolgreich erstellt.`;
          this.resetForm();
        },
        error: error => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Ein Fehler ist aufgetreten';
        },
      });
    } else {
      // Create team member
      this.authService
        .registerTeamMember(
          email,
          password,
          firstName,
          lastName,
          role,
          this.specialtiesList,
          bio
        )
        .subscribe({
          next: user => {
            this.isLoading = false;
            this.successMessage = `Team-Mitglied ${user.firstName} ${user.lastName} (${role === 'admin' ? 'Administrator' : 'Content Manager'}) wurde erfolgreich erstellt.`;
            this.resetForm();
          },
          error: error => {
            this.isLoading = false;
            this.errorMessage = error.message || 'Ein Fehler ist aufgetreten';
          },
        });
    }
  }

  resetForm(): void {
    this.userForm.reset({
      userType: 'user',
      role: 'content_manager',
    });
    this.specialtiesList = [];
    this.specialtiesInput = '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for template
  get userType() {
    return this.userForm.get('userType');
  }

  get email() {
    return this.userForm.get('email');
  }

  get password() {
    return this.userForm.get('password');
  }

  get confirmPassword() {
    return this.userForm.get('confirmPassword');
  }

  get firstName() {
    return this.userForm.get('firstName');
  }

  get lastName() {
    return this.userForm.get('lastName');
  }

  get empfehlungsnummer() {
    return this.userForm.get('empfehlungsnummer');
  }

  get role() {
    return this.userForm.get('role');
  }

  get bio() {
    return this.userForm.get('bio');
  }
}
