import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';

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
  private router = inject(Router);
  isAuthenticated$ = this.authService.isAuthenticated$;
  currentUser$ = this.authService.currentUser$;

  // Check if user has content manager or admin role
  isContentManagerOrAdmin$ = this.currentUser$.pipe(
    map(user => user?.role === 'content_manager' || user?.role === 'admin')
  );

  // Check if user is admin only
  isAdmin$ = this.currentUser$.pipe(map(user => user?.role === 'admin'));

  navLinks = [
    { path: '/', label: 'Startseite', exact: true, requiresAuth: false, requiresRole: false, requiresAdmin: false },
    { path: '/courses', label: 'Kurse', exact: false, requiresAuth: false, requiresRole: false, requiresAdmin: false },
    { path: '/my-courses', label: 'Meine Kurse', exact: false, requiresAuth: true, requiresRole: false, requiresAdmin: false },
    { path: '/dashboard', label: 'Dashboard', exact: false, requiresAuth: true, requiresRole: true, requiresAdmin: false },
    { path: '/dashboard/user-management', label: 'Benutzerverwaltung', exact: false, requiresAuth: true, requiresRole: false, requiresAdmin: true },
    { path: '/about', label: 'Über uns', exact: false, requiresAuth: false, requiresRole: false, requiresAdmin: false },
    { path: '/contact', label: 'Kontakt', exact: false, requiresAuth: false, requiresRole: false, requiresAdmin: false },
  ];

  toggleMenu(): void {
    this.drawer.toggle();
  }

  closeMenu(): void {
    this.drawer.close();
  }

  onLogin(): void {
    // Navigate to login page
    this.router.navigate(['/auth/login']);
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
