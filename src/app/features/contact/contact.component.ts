import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { ContactMessage } from '../../models/contact.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);

  contactForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.initializeForm();
    this.setupBusinessAddressValidation();
  }

  /**
   * Initialize the contact form with validators
   */
  private initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]],
      isBusiness: [false],
      address: this.fb.group({
        street: [''],
        houseNumber: [''],
        city: [''],
        postalCode: [''],
      }),
    });
  }

  /**
   * Setup dynamic validation for address fields when isBusiness is checked
   */
  private setupBusinessAddressValidation(): void {
    this.contactForm.get('isBusiness')?.valueChanges.subscribe((isBusiness: boolean) => {
      const addressGroup = this.contactForm.get('address') as FormGroup;

      if (isBusiness) {
        // Add required validators when business is checked
        addressGroup.get('street')?.setValidators([Validators.required]);
        addressGroup.get('houseNumber')?.setValidators([Validators.required]);
        addressGroup.get('city')?.setValidators([Validators.required]);
        addressGroup.get('postalCode')?.setValidators([Validators.required]);
      } else {
        // Remove validators when business is unchecked
        addressGroup.get('street')?.clearValidators();
        addressGroup.get('houseNumber')?.clearValidators();
        addressGroup.get('city')?.clearValidators();
        addressGroup.get('postalCode')?.clearValidators();
      }

      // Update validity
      addressGroup.get('street')?.updateValueAndValidity();
      addressGroup.get('houseNumber')?.updateValueAndValidity();
      addressGroup.get('city')?.updateValueAndValidity();
      addressGroup.get('postalCode')?.updateValueAndValidity();
    });
  }

  /**
   * Check if a form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Check if an address field is invalid and touched
   */
  isAddressFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get('address')?.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.contactForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach((key) => {
        this.contactForm.get(key)?.markAsTouched();
      });

      if (this.contactForm.get('isBusiness')?.value) {
        const addressGroup = this.contactForm.get('address') as FormGroup;
        Object.keys(addressGroup.controls).forEach((key) => {
          addressGroup.get(key)?.markAsTouched();
        });
      }
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    const formValue = this.contactForm.value;
    const contactMessage: ContactMessage = {
      name: formValue.name,
      email: formValue.email,
      message: formValue.message,
      isBusiness: formValue.isBusiness,
      address: formValue.isBusiness ? formValue.address : undefined,
    };

    this.contactService.submitContactMessage(contactMessage).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.successMessage = response.message;
        this.contactForm.reset();
        this.contactForm.patchValue({ isBusiness: false });

        // Hide success message after 5 seconds
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.submitError = true;
        this.errorMessage =
          'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
        console.error('Error submitting contact form:', error);

        // Hide error message after 5 seconds
        setTimeout(() => {
          this.submitError = false;
        }, 5000);
      },
    });
  }
}
