import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';

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
  currentUser$ = this.authService.currentUser$;

  // Check if user has content manager or admin role
  isContentManagerOrAdmin$ = this.currentUser$.pipe(
    map(user => user?.role === 'content_manager' || user?.role === 'admin')
  );

  navLinks = [
    { path: '/', label: 'Startseite', exact: true, requiresAuth: false, requiresRole: false },
    { path: '/courses', label: 'Kurse', exact: false, requiresAuth: false, requiresRole: false },
    { path: '/my-courses', label: 'Meine Kurse', exact: false, requiresAuth: true, requiresRole: false },
    { path: '/dashboard', label: 'Dashboard', exact: false, requiresAuth: true, requiresRole: true },
    { path: '/about', label: 'Über uns', exact: false, requiresAuth: false, requiresRole: false },
    { path: '/contact', label: 'Kontakt', exact: false, requiresAuth: false, requiresRole: false },
  ];
}
