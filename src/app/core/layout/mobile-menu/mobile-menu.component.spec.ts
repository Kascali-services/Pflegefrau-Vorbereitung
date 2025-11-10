import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileMenuComponent } from './mobile-menu.component';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MobileMenuComponent', () => {
  let component: MobileMenuComponent;
  let fixture: ComponentFixture<MobileMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileMenuComponent, BrowserAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileMenuComponent);
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

  it('should render menu button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const menuButton = compiled.querySelector('.menu-button');
    expect(menuButton).toBeTruthy();
    expect(menuButton?.getAttribute('aria-label')).toBe('Open navigation menu');
  });

  it('should render mat-drawer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const drawer = compiled.querySelector('mat-drawer');
    expect(drawer).toBeTruthy();
  });

  it('should toggle drawer when menu button is clicked', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const menuButton = compiled.querySelector('.menu-button') as HTMLButtonElement;

    // Initially closed
    expect(component.drawer.opened).toBe(false);

    // Open drawer
    menuButton.click();
    await fixture.whenStable();
    expect(component.drawer.opened).toBe(true);

    // Close drawer
    menuButton.click();
    await fixture.whenStable();
    expect(component.drawer.opened).toBe(false);
  });

  it('should close drawer when closeMenu is called', async () => {
    // Open drawer first
    await component.drawer.open();
    expect(component.drawer.opened).toBe(true);

    // Close drawer
    component.closeMenu();
    await fixture.whenStable();
    expect(component.drawer.opened).toBe(false);
  });

  it('should render close button in drawer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const closeButton = compiled.querySelector('.close-button');
    expect(closeButton).toBeTruthy();
    expect(closeButton?.getAttribute('aria-label')).toBe('Close navigation menu');
  });

  it('should render all navigation links in drawer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.nav-link');
    expect(links.length).toBe(5);
  });
});
