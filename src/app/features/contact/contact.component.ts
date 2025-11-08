import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contact-container">
      <h1>Contact</h1>
      <p>Contactez-nous pour plus d'informations.</p>
    </div>
  `,
  styles: [
    `
      .contact-container {
        padding: 2rem;
      }
    `,
  ],
})
export class ContactComponent {}
