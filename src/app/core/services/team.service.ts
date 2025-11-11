import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TeamMember } from '../../models/team.model';

/**
 * Mock team members data
 */
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-001',
    firstName: 'Dr. Anna',
    lastName: 'Schmidt',
    role: 'Leiterin der Pflegeausbildung',
    bio: 'Erfahrene Pflegepädagogin mit über 15 Jahren Erfahrung in der Ausbildung von Pflegefachkräften.',
    avatarUrl: '/assets/team/anna-schmidt.jpg',
    specialties: ['Pflegepädagogik', 'Anatomie', 'Pflegepraxis'],
  },
  {
    id: 'team-002',
    firstName: 'Michael',
    lastName: 'Weber',
    role: 'Pflegefachmann & Dozent',
    bio: 'Spezialisiert auf praktische Pflegetechniken und hat zahlreiche Auszubildende erfolgreich betreut.',
    avatarUrl: '/assets/team/michael-weber.jpg',
    specialties: ['Grundpflege', 'Medizinische Pflege', 'Notfallversorgung'],
  },
  {
    id: 'team-003',
    firstName: 'Sarah',
    lastName: 'Müller',
    role: 'Pflegefachfrau & Mentorin',
    bio: 'Engagierte Mentorin für internationale Bewerberinnen und Bewerber mit Schwerpunkt auf interkultureller Kommunikation.',
    avatarUrl: '/assets/team/sarah-mueller.jpg',
    specialties: ['Interkulturelle Pflege', 'Deutsch für Pflege', 'Patientenkommunikation'],
  },
  {
    id: 'team-004',
    firstName: 'Thomas',
    lastName: 'Becker',
    role: 'Gesundheits- und Krankenpfleger',
    bio: 'Experte für das deutsche Gesundheitssystem und rechtliche Grundlagen der Pflege.',
    avatarUrl: '/assets/team/thomas-becker.jpg',
    specialties: ['Gesundheitssystem', 'Pflegestandards', 'Qualitätsmanagement'],
  },
];

/**
 * TeamService - Manages team member data
 * Currently uses mock data; prepared for API connection
 */
@Injectable({
  providedIn: 'root',
})
export class TeamService {
  /**
   * Get all team members
   */
  getAllTeamMembers(): Observable<TeamMember[]> {
    return of(MOCK_TEAM_MEMBERS);
  }

  /**
   * Get a team member by ID
   */
  getTeamMemberById(id: string): Observable<TeamMember | undefined> {
    const member = MOCK_TEAM_MEMBERS.find(m => m.id === id);
    return of(member);
  }
}
