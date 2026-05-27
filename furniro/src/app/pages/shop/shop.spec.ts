import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Shop } from './shop';
import { ProductService } from '../../services/product';
import { Product } from '../../components/models/models';
import { BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';

// ── Stub child components ─────────────────────────────────────────────────────

@Component({ selector: 'app-product-card', template: '', standalone: true })
class StubProductCard { @Input() product!: Product; }

@Component({ selector: 'app-breadcrumb', template: '', standalone: true })
class StubBreadcrumb { @Input() items: BreadcrumbItem[] = []; }

@Component({ selector: 'app-service-features', template: '', standalone: true })
class StubServiceFeatures {}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${String.fromCharCode(65 + (i % 26))}${i}`,
    subtitle: `Subtitle ${i}`,
    price: (i + 1) * 10,
    originalPrice: (i + 1) * 12,
    image: `img${i}.jpg`,
    category: 'Furniture',
  }));
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('Shop', () => {
  let fixture: ComponentFixture<Shop>;
  let component: Shop;
  let mockProductService: jasmine.SpyObj<ProductService>;
  const PRODUCTS_20 = makeProducts(20);

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('ProductService', ['getAll', 'formatPrice']);
    mockProductService.getAll.and.returnValue(PRODUCTS_20);
    mockProductService.formatPrice.and.callFake((p: number) => `Rp ${p.toLocaleString()}`);

    spyOn(window, 'scrollTo');

    await TestBed.configureTestingModule({
      imports: [Shop],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    })
      .overrideComponent(Shop, {
        set: {
          imports: [CommonModule, FormsModule, StubProductCard, StubBreadcrumb, StubServiceFeatures],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Shop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Creation ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ─────────────────────────────────────────────────────────────

  it('calls productService.getAll() on init', () => {
    expect(mockProductService.getAll).toHaveBeenCalled();
  });

  it('populates displayedProducts after init', () => {
    expect(component.displayedProducts.length).toBeGreaterThan(0);
  });

  // ── Default state ─────────────────────────────────────────────────────────

  it('defaults to showCount 16', () => {
    expect(component.showCount).toBe(16);
  });

  it('defaults to sortBy default', () => {
    expect(component.sortBy).toBe('default');
  });

  it('defaults to currentPage 1', () => {
    expect(component.currentPage).toBe(1);
  });

  it('defaults to viewMode grid4', () => {
    expect(component.viewMode).toBe('grid4');
  });

  // ── totalCount getter ─────────────────────────────────────────────────────

  it('totalCount returns length of all products', () => {
    expect(component.totalCount).toBe(20);
  });

  // ── pageNumbers getter ────────────────────────────────────────────────────

  it('pageNumbers returns array 1..totalPages', () => {
    component.showCount = 8;
    component.currentPage = 1;
    component.updateDisplay();
    expect(component.pageNumbers).toEqual([1, 2, 3]);
  });

  // ── showingText getter ────────────────────────────────────────────────────

  it('showingText shows correct range on page 1 with 16 per page', () => {
    expect(component.showingText).toBe('Showing 1–16 of 20 results');
  });

  it('showingText shows correct range on page 2 with 16 per page', () => {
    component.setPage(2);
    expect(component.showingText).toBe('Showing 17–20 of 20 results');
  });

  it('showingText handles zero products', () => {
    mockProductService.getAll.and.returnValue([]);
    component.ngOnInit();
    expect(component.showingText).toBe('No products found');
  });

  // ── updateDisplay — slicing ───────────────────────────────────────────────

  it('displays 16 products by default (first page)', () => {
    expect(component.displayedProducts.length).toBe(16);
  });

  it('displays last 4 products on page 2 with showCount 16', () => {
    component.setPage(2);
    expect(component.displayedProducts.length).toBe(4);
  });

  it('displays 8 products per page when showCount is 8', () => {
    component.onShowCountChange('8');
    expect(component.displayedProducts.length).toBe(8);
  });

  it('displays all 20 products when showCount is 32', () => {
    component.onShowCountChange('32');
    expect(component.displayedProducts.length).toBe(20);
  });

  // ── updateDisplay — sorting ───────────────────────────────────────────────

  it('sorts by price ascending', () => {
    component.sortBy = 'price-asc';
    component.updateDisplay();
    const prices = component.displayedProducts.map(p => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('sorts by price descending', () => {
    component.sortBy = 'price-desc';
    component.updateDisplay();
    const prices = component.displayedProducts.map(p => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('sorts by name alphabetically', () => {
    component.sortBy = 'name';
    component.updateDisplay();
    const names = component.displayedProducts.map(p => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('default sort preserves original order', () => {
    component.sortBy = 'default';
    component.updateDisplay();
    expect(component.displayedProducts[0].id).toBe(PRODUCTS_20[0].id);
  });

  // ── onShowCountChange ─────────────────────────────────────────────────────

  it('onShowCountChange coerces string to number', () => {
    component.onShowCountChange('8');
    expect(component.showCount).toBe(8);
    expect(typeof component.showCount).toBe('number');
  });

  it('onShowCountChange resets to page 1', () => {
    component.currentPage = 2;
    component.onShowCountChange('32');
    expect(component.currentPage).toBe(1);
  });

  it('onShowCountChange with 8 gives 3 pages for 20 products', () => {
    component.onShowCountChange('8');
    expect(component.totalPages).toBe(3);
  });

  it('onShowCountChange with 16 gives 2 pages for 20 products', () => {
    component.onShowCountChange('16');
    expect(component.totalPages).toBe(2);
  });

  it('onShowCountChange with 32 gives 1 page for 20 products', () => {
    component.onShowCountChange('32');
    expect(component.totalPages).toBe(1);
  });

  it('onShowCountChange clamps currentPage when fewer pages result', () => {
    component.onShowCountChange('8');
    component.setPage(3);
    expect(component.currentPage).toBe(3);
    component.onShowCountChange('32');
    expect(component.currentPage).toBe(1);
  });

  // ── onSortChange ──────────────────────────────────────────────────────────

  it('onSortChange resets currentPage to 1', () => {
    component.onShowCountChange('8');
    component.setPage(2);
    component.sortBy = 'name';
    component.onSortChange();
    expect(component.currentPage).toBe(1);
  });

  it('onSortChange re-runs updateDisplay', () => {
    spyOn(component, 'updateDisplay').and.callThrough();
    component.onSortChange();
    expect(component.updateDisplay).toHaveBeenCalled();
  });

  // ── setPage ───────────────────────────────────────────────────────────────

  it('setPage changes currentPage', () => {
    component.onShowCountChange('8');
    component.setPage(2);
    expect(component.currentPage).toBe(2);
  });

  it('setPage calls updateDisplay', () => {
    component.onShowCountChange('8');
    spyOn(component, 'updateDisplay').and.callThrough();
    component.setPage(2);
    expect(component.updateDisplay).toHaveBeenCalled();
  });

  it('setPage calls window.scrollTo', () => {
    component.onShowCountChange('8');
    component.setPage(2);
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('setPage ignores page < 1', () => {
    component.setPage(0);
    expect(component.currentPage).toBe(1);
  });

  it('setPage ignores page > totalPages', () => {
    component.setPage(999);
    expect(component.currentPage).toBe(1);
  });

  it('setPage ignores current page (no re-render)', () => {
    spyOn(component, 'updateDisplay').and.callThrough();
    component.setPage(1);
    expect(component.updateDisplay).not.toHaveBeenCalled();
  });

  it('setPage does not call scrollTo for invalid page', () => {
    (window.scrollTo as jasmine.Spy).calls.reset();
    component.setPage(0);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  // ── viewMode ──────────────────────────────────────────────────────────────

  it('viewMode switches to grid3', () => {
    component.viewMode = 'grid3';
    expect(component.viewMode).toBe('grid3');
  });

  it('viewMode switches back to grid4', () => {
    component.viewMode = 'grid3';
    component.viewMode = 'grid4';
    expect(component.viewMode).toBe('grid4');
  });

  // ── Template — pagination visibility ─────────────────────────────────────

  it('renders pagination when totalPages > 1', () => {
    component.onShowCountChange('8'); // 3 pages
    fixture.detectChanges();
    const pagination = fixture.debugElement.query(By.css('[data-testid="pagination"]'));
    expect(pagination).not.toBeNull();
  });

  it('hides pagination when totalPages === 1', () => {
    component.onShowCountChange('32'); // 1 page
    fixture.detectChanges();
    const pagination = fixture.debugElement.query(By.css('[data-testid="pagination"]'));
    expect(pagination).toBeNull();
  });

  // ── Template — Prev button ────────────────────────────────────────────────

  it('Prev button is disabled on page 1', () => {
    component.onShowCountChange('8');
    fixture.detectChanges();
    const prev = fixture.debugElement.query(By.css('[data-testid="prev-btn"]'));
    expect(prev.nativeElement.disabled).toBeTrue();
  });

  it('Prev button is enabled on page 2', () => {
    component.onShowCountChange('8');
    component.setPage(2);
    fixture.detectChanges();
    const prev = fixture.debugElement.query(By.css('[data-testid="prev-btn"]'));
    expect(prev.nativeElement.disabled).toBeFalse();
  });

  it('clicking Prev decrements currentPage', () => {
    component.onShowCountChange('8');
    component.setPage(3);
    fixture.detectChanges();
    const prev = fixture.debugElement.query(By.css('[data-testid="prev-btn"]'));
    prev.nativeElement.click();
    fixture.detectChanges();
    expect(component.currentPage).toBe(2);
  });

  // ── Template — Next button ────────────────────────────────────────────────

  it('Next button is disabled on last page', () => {
    component.onShowCountChange('8');
    component.setPage(3);
    fixture.detectChanges();
    const next = fixture.debugElement.query(By.css('[data-testid="next-btn"]'));
    expect(next.nativeElement.disabled).toBeTrue();
  });

  it('Next button is enabled when not on last page', () => {
    component.onShowCountChange('8');
    fixture.detectChanges();
    const next = fixture.debugElement.query(By.css('[data-testid="next-btn"]'));
    expect(next.nativeElement.disabled).toBeFalse();
  });

  it('clicking Next increments currentPage', () => {
    component.onShowCountChange('8');
    fixture.detectChanges();
    const next = fixture.debugElement.query(By.css('[data-testid="next-btn"]'));
    next.nativeElement.click();
    fixture.detectChanges();
    expect(component.currentPage).toBe(2);
  });

  // ── Template — page buttons ───────────────────────────────────────────────

  it('renders correct number of page buttons', () => {
    component.onShowCountChange('8'); // 3 pages
    fixture.detectChanges();
    const btns = fixture.debugElement.queryAll(By.css('[data-testid="page-btn"]'));
    expect(btns.length).toBe(3);
  });

  it('active page button has bg-primary class', () => {
    component.onShowCountChange('8');
    component.setPage(2);
    fixture.detectChanges();
    const btns = fixture.debugElement.queryAll(By.css('[data-testid="page-btn"]'));
    expect(btns[1].nativeElement.classList).toContain('bg-primary');
  });

  it('inactive page button does not have bg-primary class', () => {
    component.onShowCountChange('8');
    fixture.detectChanges();
    const btns = fixture.debugElement.queryAll(By.css('[data-testid="page-btn"]'));
    expect(btns[1].nativeElement.classList).not.toContain('bg-primary');
  });

  it('clicking a page button navigates to that page', () => {
    component.onShowCountChange('8');
    fixture.detectChanges();
    const btns = fixture.debugElement.queryAll(By.css('[data-testid="page-btn"]'));
    btns[2].nativeElement.click();
    fixture.detectChanges();
    expect(component.currentPage).toBe(3);
  });

  // ── Template — showing text ───────────────────────────────────────────────

  it('renders showing text in template', () => {
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('[data-testid="showing-text"]'));
    expect(el.nativeElement.textContent.trim()).toContain('Showing');
  });

  it('showing text updates after page change', () => {
    component.onShowCountChange('8');
    component.setPage(2);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('[data-testid="showing-text"]'));
    expect(el.nativeElement.textContent).toContain('9');
  });

  // ── Template — product grid ───────────────────────────────────────────────

  it('renders product grid', () => {
    const grid = fixture.debugElement.query(By.css('[data-testid="product-grid"]'));
    expect(grid).not.toBeNull();
  });

  it('grid has 4-column class in grid4 mode', () => {
    component.viewMode = 'grid4';
    fixture.detectChanges();
    const grid = fixture.debugElement.query(By.css('[data-testid="product-grid"]'));
    expect(grid.nativeElement.classList.toString()).toContain('md:grid-cols-4');
  });

  it('grid has 3-column class in grid3 mode', () => {
    component.viewMode = 'grid3';
    fixture.detectChanges();
    const grid = fixture.debugElement.query(By.css('[data-testid="product-grid"]'));
    expect(grid.nativeElement.classList.toString()).toContain('md:grid-cols-3');
  });

  // ── Template — view toggle buttons ───────────────────────────────────────

  it('clicking grid4 button sets viewMode to grid4', () => {
    component.viewMode = 'grid3';
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('[data-testid="grid4-btn"]'));
    btn.nativeElement.click();
    fixture.detectChanges();
    expect(component.viewMode).toBe('grid4');
  });

  it('clicking grid3 button sets viewMode to grid3', () => {
    const btn = fixture.debugElement.query(By.css('[data-testid="grid3-btn"]'));
    btn.nativeElement.click();
    fixture.detectChanges();
    expect(component.viewMode).toBe('grid3');
  });

  // ── Template — empty state ────────────────────────────────────────────────

  it('shows empty state when no products', () => {
    mockProductService.getAll.and.returnValue([]);
    component.ngOnInit();
    fixture.detectChanges();
    const empty = fixture.debugElement.query(By.css('[data-testid="empty-state"]'));
    expect(empty).not.toBeNull();
  });

  it('hides empty state when products exist', () => {
    const empty = fixture.debugElement.query(By.css('[data-testid="empty-state"]'));
    expect(empty).toBeNull();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it('totalPages is at least 1 even with 0 products', () => {
    mockProductService.getAll.and.returnValue([]);
    component.ngOnInit();
    expect(component.totalPages).toBe(1);
  });

  it('does not mutate the original products array when sorting', () => {
    const originalFirst = PRODUCTS_20[0].id;
    component.sortBy = 'price-desc';
    component.updateDisplay();
    expect(PRODUCTS_20[0].id).toBe(originalFirst);
  });

  it('showingText shows page 1 of 1 correctly with fewer products than showCount', () => {
    mockProductService.getAll.and.returnValue(makeProducts(5));
    component.ngOnInit();
    expect(component.showingText).toBe('Showing 1–5 of 5 results');
  });
});
