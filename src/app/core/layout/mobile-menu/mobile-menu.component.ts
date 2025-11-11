import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
  ],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
})
export class MobileMenuComponent {
  @ViewChild('drawer') drawer!: MatSidenav;
  private authService = inject(AuthService);
  isAuthenticated$ = this.authService.isAuthenticated$;

  navLinks = [
    { path: '/', label: 'Accueil', exact: true, requiresAuth: false },
    { path: '/courses', label: 'Cours', exact: false, requiresAuth: false },
    { path: '/my-courses', label: 'Mes Cours', exact: false, requiresAuth: true },
    { path: '/about', label: 'À propos', exact: false, requiresAuth: false },
    { path: '/contact', label: 'Contact', exact: false, requiresAuth: false },
  ];

  toggleMenu(): void {
    this.drawer.toggle();
  }

  closeMenu(): void {
    this.drawer.close();
  }

  onLogin(): void {
    // Simulate login for demo purposes
    this.authService.login('test@example.com', 'password123').subscribe({
      next: user => {
        console.log('Login successful:', user);
      },
      error: error => {
        console.error('Login failed:', error);
      },
    });
    this.closeMenu();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful from mobile menu');
      },
      error: error => {
        console.error('Logout failed:', error);
      },
    });
    this.closeMenu();
  }
}
