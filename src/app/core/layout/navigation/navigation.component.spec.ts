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

  it('should have 6 navigation links', () => {
    expect(component.navLinks.length).toBe(6);
  });

  it('should have correct navigation links', () => {
    expect(component.navLinks[0].path).toBe('/');
    expect(component.navLinks[0].label).toBe('Startseite');
    expect(component.navLinks[0].exact).toBe(true);

    expect(component.navLinks[1].path).toBe('/courses');
    expect(component.navLinks[1].label).toBe('Kurse');
    expect(component.navLinks[1].exact).toBe(false);

    expect(component.navLinks[2].path).toBe('/my-courses');
    expect(component.navLinks[2].label).toBe('Meine Kurse');
    expect(component.navLinks[2].exact).toBe(false);

    // Verwaltung is the parent menu with children
    expect(component.navLinks[3].label).toBe('Verwaltung');
    expect(component.navLinks[3].children).toBeDefined();
    expect(component.navLinks[3].children?.length).toBe(3);

    expect(component.navLinks[4].path).toBe('/about');
    expect(component.navLinks[4].label).toBe('Über uns');
    expect(component.navLinks[4].exact).toBe(false);

    expect(component.navLinks[5].path).toBe('/contact');
    expect(component.navLinks[5].label).toBe('Kontakt');
    expect(component.navLinks[5].exact).toBe(false);
  });

  it('should render navigation element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nav = compiled.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('should render all top-level navigation items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.nav-item');
    // We should have 5 top-level items visible (Startseite, Kurse, Über uns, Kontakt + potentially more based on auth)
    expect(items.length).toBeGreaterThanOrEqual(4);
  });

  it('should have correct routerLink attributes for links with paths', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const firstLink = compiled.querySelector('a.nav-link') as HTMLElement;
    if (firstLink) {
      expect(firstLink.getAttribute('ng-reflect-router-link')).toBe('/');
    }
  });

  it('should have aria-labels on links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a.nav-link');
    links.forEach(link => {
      expect(link.getAttribute('aria-label')).toContain('Navigate to');
    });
  });
});
