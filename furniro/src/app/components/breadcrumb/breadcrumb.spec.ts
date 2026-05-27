import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Breadcrumb, BreadcrumbItem } from './breadcrumb';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('Breadcrumb', () => {
  let component: Breadcrumb;
  let fixture: ComponentFixture<Breadcrumb>;

  const mockItems: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Products', link: '/products' },
    { label: 'Details' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Breadcrumb, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Breadcrumb);
    component = fixture.componentInstance;
    component.items = mockItems;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all breadcrumb items', () => {
    const textContent = fixture.nativeElement.textContent;

    expect(textContent).toContain('Home');
    expect(textContent).toContain('Products');
    expect(textContent).toContain('Details');
  });

  it('should render links for non-last items', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));

    expect(links.length).toBe(2);

    expect(links[0].nativeElement.textContent.trim()).toBe('Home');
    expect(links[1].nativeElement.textContent.trim()).toBe('Products');
  });

  it('should render the last item as plain text', () => {
    const span = fixture.debugElement.query(By.css('span'));

    expect(span).toBeTruthy();
    expect(span.nativeElement.textContent.trim()).toBe('Details');
  });

  it('should render separators for non-last items', () => {
    const separators = fixture.debugElement.queryAll(By.css('svg'));

    // One separator after each non-last item
    expect(separators.length).toBe(2);
  });

  it('should not render links when items array is empty', () => {
    component.items = [];
    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.css('a'));
    const spans = fixture.debugElement.queryAll(By.css('span'));

    expect(links.length).toBe(0);
    expect(spans.length).toBe(0);
  });
});