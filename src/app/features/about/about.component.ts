import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <h1>À propos</h1>
      <p>Bienvenue sur notre plateforme d'éducation médicale.</p>
    </div>
  `,
  styles: [
    `
      .about-container {
        padding: 2rem;
      }
    `,
  ],
})
export class AboutComponent {}
