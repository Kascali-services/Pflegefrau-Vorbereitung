import { TestBed } from '@angular/core/testing';
import { TeamService } from './team.service';

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all team members', done => {
    service.getAllTeamMembers().subscribe(members => {
      expect(members).toBeTruthy();
      expect(members.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should return a team member by id', done => {
    service.getTeamMemberById('team-001').subscribe(member => {
      expect(member).toBeTruthy();
      expect(member?.id).toBe('team-001');
      done();
    });
  });

  it('should return undefined for non-existent member', done => {
    service.getTeamMemberById('non-existent').subscribe(member => {
      expect(member).toBeUndefined();
      done();
    });
  });
});
