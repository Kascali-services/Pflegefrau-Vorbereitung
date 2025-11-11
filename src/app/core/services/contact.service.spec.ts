import { TestBed } from '@angular/core/testing';
import { ContactService } from './contact.service';
import { ContactMessage } from '../../models/contact.model';

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should submit contact message and return success', (done) => {
    const testMessage: ContactMessage = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message',
      isBusiness: false,
    };

    service.submitContactMessage(testMessage).subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.message).toBeTruthy();
      done();
    });
  });

  it('should submit business contact message with address', (done) => {
    const testMessage: ContactMessage = {
      name: 'Test Business',
      email: 'business@example.com',
      message: 'Business inquiry',
      isBusiness: true,
      address: {
        street: 'Hauptstrasse',
        houseNumber: '123',
        city: 'Berlin',
        postalCode: '10115',
      },
    };

    service.submitContactMessage(testMessage).subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.message).toBeTruthy();
      done();
    });
  });
});
