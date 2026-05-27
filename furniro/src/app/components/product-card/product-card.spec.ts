import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { ProductCard } from './product-card';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { ComparisonService } from '../../services/comparison';
import { AuthService } from '../../services/auth.service';
import { Product } from '../models/models';
import { Router } from '@angular/router';

const mockProduct: Product = {
  id: 42,
  name: 'Test Chair',
  subtitle: 'Comfortable seat',
  price: 500000,
  image: 'chair.jpg',
  category: 'Chair',
};

describe('ProductCard', () => {
  let fixture: ComponentFixture<ProductCard>;
  let component: ProductCard;
  let cartSpy: jasmine.SpyObj<CartService>;
  let wishlistSpy: jasmine.SpyObj<WishlistService>;
  let comparisonSpy: jasmine.SpyObj<ComparisonService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let productSpy: jasmine.SpyObj<ProductService>;
  let router: Router;

  const wishlistIdsSubject = new BehaviorSubject<number[]>([]);
  const comparisonIdsSubject = new BehaviorSubject<number[]>([]);

  beforeEach(async () => {
    productSpy = jasmine.createSpyObj('ProductService', ['formatPrice']);
    productSpy.formatPrice.and.callFake((p: number) => `Rp ${p}`);

    cartSpy = jasmine.createSpyObj('CartService', ['addToCart', 'openSidebar']);
    wishlistSpy = jasmine.createSpyObj('WishlistService', ['toggle'], {
      ids$: wishlistIdsSubject.asObservable(),
    });
    comparisonSpy = jasmine.createSpyObj('ComparisonService', ['toggle'], {
      ids$: comparisonIdsSubject.asObservable(),
    });
    authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    authSpy.isLoggedIn.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [ProductCard, RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: productSpy },
        { provide: CartService, useValue: cartSpy },
        { provide: WishlistService, useValue: wishlistSpy },
        { provide: ComparisonService, useValue: comparisonSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    })
      .overrideComponent(ProductCard, {
        set: { imports: [CommonModule, RouterTestingModule] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(ProductCard);
    component = fixture.componentInstance;
    component.product = mockProduct;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it('isWishlisted is false initially', () => {
    expect(component.isWishlisted).toBeFalse();
  });

  it('isComparing is false initially', () => {
    expect(component.isComparing).toBeFalse();
  });

  it('addedToCart is false initially', () => {
    expect(component.addedToCart).toBeFalse();
  });

  it('hovered is false initially', () => {
    expect(component.hovered).toBeFalse();
  });

  // ── ngOnInit — reactive state ─────────────────────────────────────────────

  it('sets isWishlisted true when product id is in wishlist ids', () => {
    wishlistIdsSubject.next([42]);
    fixture.detectChanges();
    expect(component.isWishlisted).toBeTrue();
  });

  it('sets isWishlisted false when product id is not in wishlist ids', () => {
    wishlistIdsSubject.next([99]);
    fixture.detectChanges();
    expect(component.isWishlisted).toBeFalse();
  });

  it('sets isComparing true when product id is in comparison ids', () => {
    comparisonIdsSubject.next([42]);
    fixture.detectChanges();
    expect(component.isComparing).toBeTrue();
  });

  // ── addToCart ─────────────────────────────────────────────────────────────

  it('addToCart calls cartService.addToCart with product and qty 1', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');
    spyOn(event, 'stopPropagation');
    component.addToCart(event);
    expect(cartSpy.addToCart).toHaveBeenCalledWith(mockProduct, 1);
  });

  it('addToCart sets addedToCart to true', () => {
    const event = new MouseEvent('click');
    component.addToCart(event);
    expect(component.addedToCart).toBeTrue();
  });

  it('addToCart resets addedToCart after 1500ms', fakeAsync(() => {
    const event = new MouseEvent('click');
    component.addToCart(event);
    expect(component.addedToCart).toBeTrue();
    tick(1500);
    expect(component.addedToCart).toBeFalse();
  }));

  it('addToCart redirects to login when not authenticated', () => {
    authSpy.isLoggedIn.and.returnValue(false);
    const event = new MouseEvent('click');
    component.addToCart(event);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(cartSpy.addToCart).not.toHaveBeenCalled();
  });

  it('addToCart calls event.preventDefault', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');
    component.addToCart(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('addToCart calls event.stopPropagation', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.addToCart(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  // ── toggleWishlist ────────────────────────────────────────────────────────

  it('toggleWishlist calls wishlistService.toggle with product id and product', () => {
    const event = new MouseEvent('click');
    component.toggleWishlist(event);
    expect(wishlistSpy.toggle).toHaveBeenCalledWith(mockProduct.id, mockProduct);
  });

  it('toggleWishlist redirects to login when not authenticated', () => {
    authSpy.isLoggedIn.and.returnValue(false);
    const event = new MouseEvent('click');
    component.toggleWishlist(event);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(wishlistSpy.toggle).not.toHaveBeenCalled();
  });

  it('toggleWishlist calls event.preventDefault', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');
    component.toggleWishlist(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  // ── toggleCompare ─────────────────────────────────────────────────────────

  it('toggleCompare calls comparisonService.toggle with product id', () => {
    const event = new MouseEvent('click');
    component.toggleCompare(event);
    expect(comparisonSpy.toggle).toHaveBeenCalledWith(mockProduct.id);
  });

  it('toggleCompare calls event.stopPropagation', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.toggleCompare(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  // ── formatPrice ───────────────────────────────────────────────────────────

  it('formatPrice delegates to productService', () => {
    const result = component.formatPrice(500000);
    expect(productSpy.formatPrice).toHaveBeenCalledWith(500000);
    expect(result).toBe('Rp 500000');
  });
});
