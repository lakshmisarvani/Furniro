import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ProductDetail } from './product-detail';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { ComparisonService } from '../../services/comparison';
import { Product } from '../../components/models/models';
import { BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';

// ── Stubs ─────────────────────────────────────────────────────────────────────

@Component({ selector: 'app-product-card', template: '', standalone: true })
class StubProductCard { @Input() product!: Product; }

@Component({ selector: 'app-breadcrumb', template: '', standalone: true })
class StubBreadcrumb { @Input() items: BreadcrumbItem[] = []; }

@Component({ selector: 'app-service-features', template: '', standalone: true })
class StubServiceFeatures {}

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockProduct: Product = {
  id: 1,
  name: 'Test Sofa',
  subtitle: 'Very comfortable',
  price: 2500000,
  image: 'sofa.jpg',
  images: ['sofa.jpg', 'sofa2.jpg'],
  category: 'Sofa',
  sizes: ['S', 'M', 'L'],
  colors: ['red', 'blue'],
};

const relatedProducts: Product[] = [
  { id: 2, name: 'Chair', subtitle: '', price: 500000, image: 'chair.jpg', category: 'Chair' },
  { id: 3, name: 'Table', subtitle: '', price: 800000, image: 'table.jpg', category: 'Table' },
];

describe('ProductDetail', () => {
  let fixture: ComponentFixture<ProductDetail>;
  let component: ProductDetail;
  let productSpy: jasmine.SpyObj<ProductService>;
  let cartSpy: jasmine.SpyObj<CartService>;
  let wishlistSpy: jasmine.SpyObj<WishlistService>;
  let comparisonSpy: jasmine.SpyObj<ComparisonService>;

  const wishlistIdsSubject = new BehaviorSubject<number[]>([]);
  const comparisonIdsSubject = new BehaviorSubject<number[]>([]);

  beforeEach(async () => {
    productSpy = jasmine.createSpyObj('ProductService', ['getById', 'getRelated', 'formatPrice']);
    productSpy.getById.and.returnValue(mockProduct);
    productSpy.getRelated.and.returnValue(relatedProducts);
    productSpy.formatPrice.and.callFake((p: number) => `Rp ${p}`);

    cartSpy = jasmine.createSpyObj('CartService', ['addToCart']);

    wishlistSpy = jasmine.createSpyObj('WishlistService', ['toggle', 'isWishlisted'], {
      ids$: wishlistIdsSubject.asObservable(),
    });
    wishlistSpy.isWishlisted.and.returnValue(false);

    comparisonSpy = jasmine.createSpyObj('ComparisonService', ['toggle', 'isComparing', 'navigateToCompare'], {
      ids$: comparisonIdsSubject.asObservable(),
    });
    comparisonSpy.isComparing.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ProductDetail, RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: productSpy },
        { provide: CartService, useValue: cartSpy },
        { provide: WishlistService, useValue: wishlistSpy },
        { provide: ComparisonService, useValue: comparisonSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '1' })) },
        },
      ],
    })
      .overrideComponent(ProductDetail, {
        set: { imports: [CommonModule, RouterTestingModule, StubProductCard, StubBreadcrumb, StubServiceFeatures] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ──────────────────────────────────────────────────────────────

  it('loads product by id on init', () => {
    expect(productSpy.getById).toHaveBeenCalledWith(1);
    expect(component.product).toEqual(mockProduct);
  });

  it('loads related products on init', () => {
    expect(productSpy.getRelated).toHaveBeenCalledWith(1, 4);
    expect(component.relatedProducts).toEqual(relatedProducts);
  });

  it('sets breadcrumbs correctly', () => {
    expect(component.breadcrumbs[0].label).toBe('Home');
    expect(component.breadcrumbs[1].label).toBe('Shop');
    expect(component.breadcrumbs[2].label).toBe(mockProduct.name);
  });

  it('sets selectedSize to first size', () => {
    expect(component.selectedSize).toBe('S');
  });

  it('sets selectedColor to first color', () => {
    expect(component.selectedColor).toBe('red');
  });

  it('selectedImage starts at 0', () => {
    expect(component.selectedImage).toBe(0);
  });

  // ── currentImage ──────────────────────────────────────────────────────────

  it('currentImage returns first image initially', () => {
    expect(component.currentImage).toBe('sofa.jpg');
  });

  it('currentImage returns image at selectedImage index', () => {
    component.selectedImage = 1;
    expect(component.currentImage).toBe('sofa2.jpg');
  });

  it('currentImage falls back to product.image if no images array', () => {
    component.product = { ...mockProduct, images: undefined };
    component.selectedImage = 0;
    expect(component.currentImage).toBe('sofa.jpg');
  });

  // ── quantity ──────────────────────────────────────────────────────────────

  it('quantity starts at 1', () => {
    expect(component.quantity).toBe(1);
  });

  it('changeQty increases quantity', () => {
    component.changeQty(1);
    expect(component.quantity).toBe(2);
  });

  it('changeQty decreases quantity', () => {
    component.quantity = 3;
    component.changeQty(-1);
    expect(component.quantity).toBe(2);
  });

  it('changeQty does not go below 1', () => {
    component.quantity = 1;
    component.changeQty(-1);
    expect(component.quantity).toBe(1);
  });

  // ── addToCart ─────────────────────────────────────────────────────────────

  it('addToCart calls cartService.addToCart with product and quantity', () => {
    component.quantity = 2;
    component.addToCart();
    expect(cartSpy.addToCart).toHaveBeenCalledWith(mockProduct, 2);
  });

  it('addToCart sets addedToCart to true', () => {
    component.addToCart();
    expect(component.addedToCart).toBeTrue();
  });

  it('addToCart resets addedToCart after 1500ms', fakeAsync(() => {
    component.addToCart();
    tick(1500);
    expect(component.addedToCart).toBeFalse();
  }));

  it('addToCart does nothing when product is undefined', () => {
    component.product = undefined;
    component.addToCart();
    expect(cartSpy.addToCart).not.toHaveBeenCalled();
  });

  // ── toggleWishlist ────────────────────────────────────────────────────────

  it('toggleWishlist calls wishlistService.toggle', () => {
    component.toggleWishlist();
    expect(wishlistSpy.toggle).toHaveBeenCalledWith(mockProduct.id);
  });

  it('toggleWishlist does nothing when product is undefined', () => {
    component.product = undefined;
    component.toggleWishlist();
    expect(wishlistSpy.toggle).not.toHaveBeenCalled();
  });

  // ── toggleCompare ─────────────────────────────────────────────────────────

  it('toggleCompare calls comparisonService.toggle', () => {
    component.toggleCompare();
    expect(comparisonSpy.toggle).toHaveBeenCalledWith(mockProduct.id);
  });

  it('toggleCompare navigates to compare when not already comparing', () => {
    component.isComparing = false;
    component.toggleCompare();
    expect(comparisonSpy.navigateToCompare).toHaveBeenCalled();
  });

  it('toggleCompare does not navigate when already comparing', () => {
    component.isComparing = true;
    component.toggleCompare();
    expect(comparisonSpy.navigateToCompare).not.toHaveBeenCalled();
  });

  // ── activeTab ─────────────────────────────────────────────────────────────

  it('activeTab defaults to description', () => {
    expect(component.activeTab).toBe('description');
  });

  it('tabs array has 3 entries', () => {
    expect(component.tabs.length).toBe(3);
  });

  // ── stars ─────────────────────────────────────────────────────────────────

  it('stars returns array of length 5', () => {
    expect(component.stars(4).length).toBe(5);
  });

  // ── formatPrice ───────────────────────────────────────────────────────────

  it('formatPrice delegates to productService', () => {
    const result = component.formatPrice(1000000);
    expect(productSpy.formatPrice).toHaveBeenCalledWith(1000000);
    expect(result).toBe('Rp 1000000');
  });

  // ── wishlist/compare reactive updates ────────────────────────────────────

  it('isWishlisted updates when wishlist ids change', () => {
    wishlistSpy.isWishlisted.and.returnValue(true);
    wishlistIdsSubject.next([1]);
    expect(component.isWishlisted).toBeTrue();
  });

  it('isComparing updates when comparison ids change', () => {
    comparisonSpy.isComparing.and.returnValue(true);
    comparisonIdsSubject.next([1]);
    expect(component.isComparing).toBeTrue();
  });
});
