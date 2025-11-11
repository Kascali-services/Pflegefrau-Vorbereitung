import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ContactMessage } from '../../models/contact.model';

/**
 * ContactService - Manages contact form submissions
 * Currently simulates backend API calls with delays
 * Can be extended to use HTTP API in production
 */
@Injectable({
  providedIn: 'root',
})
export class ContactService {
  /**
   * Submit contact form message
   * Simulates a backend API call with a 1-second delay
   * @param message The contact message to submit
   * @returns Observable that emits success response
   */
  submitContactMessage(message: ContactMessage): Observable<{ success: boolean; message: string }> {
    // Log the message for debugging (in production this would send to backend)
    console.log('Contact message submitted:', message);

    // Simulate API call with delay
    return of({
      success: true,
      message: 'Vielen Dank für Ihre Nachricht! Wir werden uns bald bei Ihnen melden.',
    }).pipe(delay(1000));
  }
}
