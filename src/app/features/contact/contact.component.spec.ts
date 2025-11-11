import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactComponent } from './contact.component';
import { ContactService } from '../../core/services/contact.service';
import { of } from 'rxjs';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let contactService: jasmine.SpyObj<ContactService>;

  beforeEach(async () => {
    const contactServiceSpy = jasmine.createSpyObj('ContactService', ['submitContactMessage']);

    await TestBed.configureTestingModule({
      imports: [ContactComponent, ReactiveFormsModule],
      providers: [{ provide: ContactService, useValue: contactServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    contactService = TestBed.inject(ContactService) as jasmine.SpyObj<ContactService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.contactForm.get('name')?.value).toBe('');
    expect(component.contactForm.get('email')?.value).toBe('');
    expect(component.contactForm.get('message')?.value).toBe('');
    expect(component.contactForm.get('isBusiness')?.value).toBe(false);
  });

  it('should mark form as invalid when required fields are empty', () => {
    expect(component.contactForm.valid).toBeFalsy();
  });

  it('should mark form as valid when all required fields are filled', () => {
    component.contactForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message',
    });
    expect(component.contactForm.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.contactForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should add address validation when isBusiness is true', () => {
    component.contactForm.patchValue({ isBusiness: true });
    fixture.detectChanges();

    const addressGroup = component.contactForm.get('address');
    expect(addressGroup?.get('street')?.hasError('required')).toBeTruthy();
    expect(addressGroup?.get('city')?.hasError('required')).toBeTruthy();
  });

  it('should remove address validation when isBusiness is false', () => {
    component.contactForm.patchValue({ isBusiness: true });
    fixture.detectChanges();

    component.contactForm.patchValue({ isBusiness: false });
    fixture.detectChanges();

    const addressGroup = component.contactForm.get('address');
    expect(addressGroup?.get('street')?.hasError('required')).toBeFalsy();
    expect(addressGroup?.get('city')?.hasError('required')).toBeFalsy();
  });

  it('should submit form successfully', () => {
    contactService.submitContactMessage.and.returnValue(
      of({ success: true, message: 'Success' })
    );

    component.contactForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message',
    });

    component.onSubmit();

    expect(contactService.submitContactMessage).toHaveBeenCalled();
    expect(component.submitSuccess).toBeTruthy();
  });

  it('should not submit form when invalid', () => {
    component.onSubmit();

    expect(contactService.submitContactMessage).not.toHaveBeenCalled();
  });
});
