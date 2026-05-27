import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { ProductComparison } from './product-comparison';
import { ProductService } from '../../services/product';
import { ComparisonService } from '../../services/comparison';
import { CartService } from '../../services/cart';
import { BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { Product, ProductSpecs } from '../../components/models/models';

// ── Stubs ─────────────────────────────────────────────────────────────────────

@Component({ selector: 'app-breadcrumb', template: '', standalone: true })
class StubBreadcrumb { @Input() items: BreadcrumbItem[] = []; }

@Component({ selector: 'app-service-features', template: '', standalone: true })
class StubServiceFeatures {}

// ── Mock data ─────────────────────────────────────────────────────────────────

const makeProduct = (id: number): Product => ({
  id,
  name: `Product ${id}`,
  subtitle: `Sub ${id}`,
  price: id * 1000,
  image: `img${id}.jpg`,
  category: 'Chair',
  rating: 4,
  sku: `SKU${id}`,
});

const mockSpecs: ProductSpecs = {
  salesPackage: '1 Chair',
  modelNumber: 'FURN-123',
  secondaryMaterial: 'Plywood',
  configuration: 'Standard',
  upholsteryMaterial: 'Fabric',
  upholsteryColor: 'Grey',
  fillingMaterial: 'Foam',
  finishType: 'Matte',
  adjustableHeadrest: 'No',
  maxLoadCapacity: '150 KG',
  originOfManufacture: 'India',
  width: '80 cm',
  height: '90 cm',
  depth: '70 cm',
  weight: '15 KG',
  seatHeight: '45 cm',
  legHeight: '10 cm',
  warrantySummary: '1 Year',
  warrantyServiceType: 'Email',
  coveredInWarranty: 'Defects',
  notCoveredInWarranty: 'Wear & Tear',
  domesticWarranty: '1 Year',
};

const MOCK_PRODUCTS = [makeProduct(1), makeProduct(2), makeProduct(3)];

describe('ProductComparison', () => {
  let fixture: ComponentFixture<ProductComparison>;
  let component: ProductComparison;
  let productSpy: jasmine.SpyObj<ProductService>;
  let comparisonSpy: jasmine.SpyObj<ComparisonService>;
  let cartSpy: jasmine.SpyObj<CartService>;

  const idsSubject = new BehaviorSubject<number[]>([]);

  beforeEach(async () => {
    productSpy = jasmine.createSpyObj('ProductService', ['getAll', 'getById', 'getSpecs']);
    productSpy.getAll.and.returnValue(MOCK_PRODUCTS);
    productSpy.getById.and.callFake((id: number) => MOCK_PRODUCTS.find(p => p.id === id));
    productSpy.getSpecs.and.returnValue(mockSpecs);

    comparisonSpy = jasmine.createSpyObj('ComparisonService', ['remove', 'add'], {
      ids$: idsSubject.asObservable(),
    });

    cartSpy = jasmine.createSpyObj('CartService', ['addToCart', 'formatPrice']);
    cartSpy.formatPrice.and.callFake((p: number) => `Rp ${p}`);

    await TestBed.configureTestingModule({
      imports: [ProductComparison, RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: productSpy },
        { provide: ComparisonService, useValue: comparisonSpy },
        { provide: CartService, useValue: cartSpy },
      ],
    })
      .overrideComponent(ProductComparison, {
        set: { imports: [CommonModule, RouterTestingModule, StubBreadcrumb, StubServiceFeatures] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProductComparison);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has correct breadcrumbs', () => {
    expect(component.breadcrumbs[0].label).toBe('Home');
    expect(component.breadcrumbs[1].label).toBe('Comparison');
  });

  // ── ngOnInit ──────────────────────────────────────────────────────────────

  it('loads all products on init', () => {
    expect(productSpy.getAll).toHaveBeenCalled();
    expect(component.allProducts).toEqual(MOCK_PRODUCTS);
  });

  it('compareProducts is empty when no ids', () => {
    expect(component.compareProducts.length).toBe(0);
  });

  it('compareProducts populates when ids are emitted', () => {
    idsSubject.next([1, 2]);
    fixture.detectChanges();
    expect(component.compareProducts.length).toBe(2);
  });

  it('compareProducts filters out undefined products', () => {
    productSpy.getById.and.callFake((id: number) => id === 1 ? makeProduct(1) : undefined);
    idsSubject.next([1, 99]);
    fixture.detectChanges();
    expect(component.compareProducts.length).toBe(1);
  });

  // ── getSpecs ──────────────────────────────────────────────────────────────

  it('getSpecs delegates to productService', () => {
    const p = makeProduct(1);
    const specs = component.getSpecs(p);
    expect(productSpy.getSpecs).toHaveBeenCalledWith(p);
    expect(specs).toEqual(mockSpecs);
  });

  // ── getValue ──────────────────────────────────────────────────────────────

  it('getValue returns correct spec value for a key', () => {
    const p = makeProduct(1);
    const value = component.getValue(p, 'salesPackage');
    expect(value).toBe(mockSpecs.salesPackage);
  });

  // ── remove ────────────────────────────────────────────────────────────────

  it('remove calls comparisonService.remove', () => {
    component.remove(1);
    expect(comparisonSpy.remove).toHaveBeenCalledWith(1);
  });

  // ── addProduct ────────────────────────────────────────────────────────────

  it('addProduct calls comparisonService.add with id', () => {
    component.addProduct(3);
    expect(comparisonSpy.add).toHaveBeenCalledWith(3);
  });

  it('addProduct closes product picker', () => {
    component.showProductPicker = true;
    component.addProduct(3);
    expect(component.showProductPicker).toBeFalse();
  });

  // ── addToCart ─────────────────────────────────────────────────────────────

  it('addToCart calls cartService.addToCart with product and qty 1', () => {
    const p = makeProduct(1);
    component.addToCart(p);
    expect(cartSpy.addToCart).toHaveBeenCalledWith(p, 1);
  });

  // ── availableToAdd ────────────────────────────────────────────────────────

  it('availableToAdd returns all products when compareProducts is empty', () => {
    expect(component.availableToAdd.length).toBe(MOCK_PRODUCTS.length);
  });

  it('availableToAdd excludes already compared products', () => {
    idsSubject.next([1]);
    fixture.detectChanges();
    const available = component.availableToAdd;
    expect(available.find(p => p.id === 1)).toBeUndefined();
    expect(available.length).toBe(MOCK_PRODUCTS.length - 1);
  });

  // ── starsArr ──────────────────────────────────────────────────────────────

  it('starsArr returns array of 5 booleans', () => {
    const stars = component.starsArr(4);
    expect(stars.length).toBe(5);
    expect(typeof stars[0]).toBe('boolean');
  });

  it('starsArr marks correct number of stars as filled', () => {
    const stars = component.starsArr(3);
    const filled = stars.filter(s => s).length;
    expect(filled).toBe(3);
  });

  it('starsArr handles 0 rating', () => {
    const stars = component.starsArr(0);
    expect(stars.every(s => !s)).toBeTrue();
  });

  // ── fmt ───────────────────────────────────────────────────────────────────

  it('fmt delegates to cartService.formatPrice', () => {
    const result = component.fmt(350000);
    expect(cartSpy.formatPrice).toHaveBeenCalledWith(350000);
    expect(result).toBe('Rp 350000');
  });

  // ── showProductPicker ─────────────────────────────────────────────────────

  it('showProductPicker starts as false', () => {
    expect(component.showProductPicker).toBeFalse();
  });
});
