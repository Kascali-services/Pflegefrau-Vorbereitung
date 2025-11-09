import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, BrowserAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with isScrolled as false', () => {
    expect(component.isScrolled).toBe(false);
  });

  it('should set isScrolled to true when window scrolls', () => {
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 100,
    });
    component.onWindowScroll();
    expect(component.isScrolled).toBe(true);
  });

  it('should set isScrolled to false when at top of page', () => {
    // Mock window.scrollY at top
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
    component.onWindowScroll();
    expect(component.isScrolled).toBe(false);
  });

  it('should render mat-toolbar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const toolbar = compiled.querySelector('mat-toolbar');
    expect(toolbar).toBeTruthy();
  });

  it('should render logo link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logoLink = compiled.querySelector('.logo-link');
    expect(logoLink).toBeTruthy();
    expect(logoLink?.getAttribute('href')).toBe('/');
  });

  it('should render navigation component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navigation = compiled.querySelector('app-navigation');
    expect(navigation).toBeTruthy();
  });

  it('should render mobile menu component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const mobileMenu = compiled.querySelector('app-mobile-menu');
    expect(mobileMenu).toBeTruthy();
  });

  it('should add scrolled class when isScrolled is true', () => {
    component.isScrolled = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const toolbar = compiled.querySelector('mat-toolbar');
    expect(toolbar?.classList.contains('scrolled')).toBe(true);
  });
});
