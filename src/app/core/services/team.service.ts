import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TeamMember } from '../../models/team.model';
import { UserService } from './user.service';

/**
 * TeamService - Manages team member data
 * Uses UserService to communicate with backend user-service endpoints
 */
@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private userService = inject(UserService);

  /**
   * Get all team members
   */
  getAllTeamMembers(): Observable<TeamMember[]> {
    return this.userService.getAllTeamMembers();
  }

  /**
   * Get a team member by ID
   */
  getTeamMemberById(id: string): Observable<TeamMember> {
    return this.userService.getTeamMemberById(id);
  }
}
