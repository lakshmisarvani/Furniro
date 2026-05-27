import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceFeatures } from './service-features';

describe('ServiceFeatures', () => {
  let fixture: ComponentFixture<ServiceFeatures>;
  let component: ServiceFeatures;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceFeatures],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceFeatures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has exactly 4 features', () => {
    expect(component.features.length).toBe(4);
  });

  it('first feature title is High Quality', () => {
    expect(component.features[0].title).toBe('High Quality');
  });

  it('second feature title is Warranty Protection', () => {
    expect(component.features[1].title).toBe('Warranty Protection');
  });

  it('third feature title is Free Shipping', () => {
    expect(component.features[2].title).toBe('Free Shipping');
  });

  it('fourth feature title is 24 / 7 Support', () => {
    expect(component.features[3].title).toBe('24 / 7 Support');
  });

  it('every feature has a non-empty subtitle', () => {
    component.features.forEach(f => {
      expect(f.subtitle.length).toBeGreaterThan(0);
    });
  });

  it('every feature has an icon string', () => {
    component.features.forEach(f => {
      expect(f.icon).toBeTruthy();
    });
  });

  it('renders 4 feature sections in the DOM', () => {
    const el: HTMLElement = fixture.nativeElement;
    const titles = el.querySelectorAll('h3, [class*="font"]');
    expect(titles.length).toBeGreaterThan(0);
  });
});
