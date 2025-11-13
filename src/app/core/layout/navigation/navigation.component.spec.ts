import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 5 navigation links', () => {
    expect(component.navLinks.length).toBe(5);
  });

  it('should have correct navigation links', () => {
    expect(component.navLinks[0].path).toBe('/');
    expect(component.navLinks[0].label).toBe('Accueil');
    expect(component.navLinks[0].exact).toBe(true);

    expect(component.navLinks[1].path).toBe('/courses');
    expect(component.navLinks[1].label).toBe('Cours');
    expect(component.navLinks[1].exact).toBe(false);

    expect(component.navLinks[2].path).toBe('/my-courses');
    expect(component.navLinks[2].label).toBe('Mes Cours');
    expect(component.navLinks[2].exact).toBe(false);

    expect(component.navLinks[3].path).toBe('/about');
    expect(component.navLinks[3].label).toBe('À propos');
    expect(component.navLinks[3].exact).toBe(false);

    expect(component.navLinks[4].path).toBe('/contact');
    expect(component.navLinks[4].label).toBe('Contact');
    expect(component.navLinks[4].exact).toBe(false);
  });

  it('should render navigation element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nav = compiled.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('should render all navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.nav-link');
    expect(links.length).toBe(5);
  });

  it('should have correct routerLink attributes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const firstLink = compiled.querySelector('.nav-link') as HTMLElement;
    expect(firstLink.getAttribute('ng-reflect-router-link')).toBe('/');
  });

  it('should have aria-labels on links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.nav-link');
    links.forEach(link => {
      expect(link.getAttribute('aria-label')).toContain('Navigate to');
    });
  });
});
