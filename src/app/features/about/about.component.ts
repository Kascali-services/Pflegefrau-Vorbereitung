import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamCarouselComponent } from '../../shared/components/team-carousel/team-carousel.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TeamCarouselComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {}
