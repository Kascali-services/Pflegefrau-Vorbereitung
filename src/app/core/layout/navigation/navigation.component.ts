import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatButtonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  private authService = inject(AuthService);
  isAuthenticated$ = this.authService.isAuthenticated$;

  navLinks = [
    { path: '/', label: 'Accueil', exact: true, requiresAuth: false },
    { path: '/courses', label: 'Cours', exact: false, requiresAuth: false },
    { path: '/my-courses', label: 'Mes Cours', exact: false, requiresAuth: true },
    { path: '/about', label: 'À propos', exact: false, requiresAuth: false },
    { path: '/contact', label: 'Contact', exact: false, requiresAuth: false },
  ];
}
