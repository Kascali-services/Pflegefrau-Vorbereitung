import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TeamService } from '../../../core/services/team.service';
import { TeamMember } from '../../../models/team.model';

@Component({
  selector: 'app-team-carousel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
  templateUrl: './team-carousel.component.html',
  styleUrl: './team-carousel.component.scss',
})
export class TeamCarouselComponent implements OnInit {
  private teamService = inject(TeamService);
  teamMembers: TeamMember[] = [];
  currentIndex = 0;
  visibleCards = 3; // Number of cards to show at once

  ngOnInit(): void {
    this.teamService.getAllTeamMembers().subscribe(members => {
      this.teamMembers = members;
    });
  }

  get visibleMembers(): TeamMember[] {
    if (this.teamMembers.length === 0) return [];

    const members: TeamMember[] = [];
    for (let i = 0; i < this.visibleCards; i++) {
      const index = (this.currentIndex + i) % this.teamMembers.length;
      members.push(this.teamMembers[index]);
    }
    return members;
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.teamMembers.length;
  }

  previousSlide(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.teamMembers.length) % this.teamMembers.length;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  getAvatarPlaceholder(member: TeamMember): string {
    return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`;
  }
}
