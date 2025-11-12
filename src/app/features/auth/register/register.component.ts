import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      viaRecommendation: [false],
      empfehlungsnummer: ['', [Validators.maxLength(8)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });

    // Add conditional validation for empfehlungsnummer
    this.registerForm.get('viaRecommendation')?.valueChanges.subscribe(isRecommended => {
      const empfehlungsnummerControl = this.registerForm.get('empfehlungsnummer');
      if (isRecommended) {
        empfehlungsnummerControl?.setValidators([Validators.required, Validators.maxLength(8)]);
      } else {
        empfehlungsnummerControl?.setValidators([Validators.maxLength(8)]);
        empfehlungsnummerControl?.setValue('');
      }
      empfehlungsnummerControl?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.errorMessage = 'Die Passwörter stimmen nicht überein';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, firstName, lastName, empfehlungsnummer } = this.registerForm.value;

    this.authService.register(email, password, firstName, lastName, empfehlungsnummer).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/my-courses']);
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Ein Fehler ist aufgetreten';
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
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get aktenzeichen() {
    return this.registerForm.get('aktenzeichen');
  }

  get viaRecommendation() {
    return this.registerForm.get('viaRecommendation');
  }

  get empfehlungsnummer() {
    return this.registerForm.get('empfehlungsnummer');
  }
}
