import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatButtonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  navLinks = [
    { path: '/', label: 'Accueil', exact: true },
    { path: '/courses', label: 'Cours', exact: false },
    { path: '/my-courses', label: 'Mes Cours', exact: false },
    { path: '/about', label: 'À propos', exact: false },
    { path: '/contact', label: 'Contact', exact: false },
  ];
}
