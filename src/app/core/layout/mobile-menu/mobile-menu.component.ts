import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';

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

  navLinks = [
    { path: '/', label: 'Accueil', exact: true },
    { path: '/courses', label: 'Cours', exact: false },
    { path: '/my-courses', label: 'Mes Cours', exact: false },
    { path: '/about', label: 'À propos', exact: false },
    { path: '/contact', label: 'Contact', exact: false },
  ];

  toggleMenu(): void {
    this.drawer.toggle();
  }

  closeMenu(): void {
    this.drawer.close();
  }

  onLogout(): void {
    // TODO: Implement actual logout logic
    console.log('Logout clicked from mobile menu');
    this.closeMenu();
    // For now, just log the action
    // In a real application, this would clear auth tokens and redirect to login
  }
}
