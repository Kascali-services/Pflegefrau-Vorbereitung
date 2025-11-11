import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamCarouselComponent } from './team-carousel.component';
import { TeamService } from '../../../core/services/team.service';
import { of } from 'rxjs';

describe('TeamCarouselComponent', () => {
  let component: TeamCarouselComponent;
  let fixture: ComponentFixture<TeamCarouselComponent>;
  let teamService: jasmine.SpyObj<TeamService>;

  beforeEach(async () => {
    const teamServiceSpy = jasmine.createSpyObj('TeamService', ['getAllTeamMembers']);

    await TestBed.configureTestingModule({
      imports: [TeamCarouselComponent],
      providers: [{ provide: TeamService, useValue: teamServiceSpy }],
    }).compileComponents();

    teamService = TestBed.inject(TeamService) as jasmine.SpyObj<TeamService>;
    fixture = TestBed.createComponent(TeamCarouselComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    teamService.getAllTeamMembers.and.returnValue(of([]));
    expect(component).toBeTruthy();
  });

  it('should load team members on init', () => {
    const mockMembers = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'Developer',
        bio: 'Test bio',
      },
    ];
    teamService.getAllTeamMembers.and.returnValue(of(mockMembers));

    component.ngOnInit();

    expect(component.teamMembers).toEqual(mockMembers);
  });

  it('should navigate to next slide', () => {
    component.teamMembers = [
      { id: '1', firstName: 'John', lastName: 'Doe', role: 'Developer', bio: 'Bio 1' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', role: 'Designer', bio: 'Bio 2' },
    ];
    component.currentIndex = 0;

    component.nextSlide();

    expect(component.currentIndex).toBe(1);
  });

  it('should navigate to previous slide', () => {
    component.teamMembers = [
      { id: '1', firstName: 'John', lastName: 'Doe', role: 'Developer', bio: 'Bio 1' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', role: 'Designer', bio: 'Bio 2' },
    ];
    component.currentIndex = 1;

    component.previousSlide();

    expect(component.currentIndex).toBe(0);
  });
});
