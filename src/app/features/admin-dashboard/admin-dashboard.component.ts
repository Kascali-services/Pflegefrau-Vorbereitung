import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '../../core/services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'role', 'createdAt'];

  ngOnInit(): void {
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getAllUsers().subscribe({
      next: users => {
        this.users = users;
        this.isLoading = false;
      },
      error: error => {
        this.errorMessage = error.message || 'Fehler beim Laden der Benutzer';
        this.isLoading = false;
      },
    });
  }

  getRoleLabel(role: string): string {
    const roleLabels: Record<string, string> = {
      student: 'Student',
      content_manager: 'Content Manager',
      admin: 'Administrator',
      team_member: 'Team Mitglied',
    };
    return roleLabels[role] || role;
  }

  getRoleColor(role: string): string {
    const roleColors: Record<string, string> = {
      student: 'primary',
      content_manager: 'accent',
      admin: 'warn',
      team_member: 'primary',
    };
    return roleColors[role] || 'primary';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('de-DE');
  }
}
