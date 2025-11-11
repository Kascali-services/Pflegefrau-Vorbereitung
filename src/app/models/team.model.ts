/**
 * Team member model
 */
export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  bio: string;
  avatarUrl?: string;
  email?: string;
  specialties?: string[];
}
