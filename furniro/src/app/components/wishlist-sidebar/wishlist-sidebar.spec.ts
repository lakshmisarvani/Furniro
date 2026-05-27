import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { WishlistSidebar } from './wishlist-sidebar';
import { WishlistService } from '../../services/wishlist';
import { ProductService } from '../../services/product';
import { Router } from '@angular/router';
import { Product } from '../models/models';

const makeProduct = (id: number): Product => ({
  id,
  name: `Product ${id}`,
  subtitle: `Sub ${id}`,
  price: id * 100,
  image: `img${id}.jpg`,
  category: 'Furniture',
});

describe('WishlistSidebar', () => {
  let fixture: ComponentFixture<WishlistSidebar>;
  let component: WishlistSidebar;
  let wishlistSpy: jasmine.SpyObj<WishlistService>;
  let productSpy: jasmine.SpyObj<ProductService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const sidebarOpenSubject = new BehaviorSubject<boolean>(false);
  const idsSubject = new BehaviorSubject<number[]>([]);

  beforeEach(async () => {
    wishlistSpy = jasmine.createSpyObj('WishlistService', ['closeSidebar', 'toggle'], {
      sidebarOpen$: sidebarOpenSubject.asObservable(),
      ids$: idsSubject.asObservable(),
    });

    productSpy = jasmine.createSpyObj('ProductService', ['getById', 'formatPrice']);
    productSpy.formatPrice.and.callFake((p: number) => `Rp ${p}`);
    productSpy.getById.and.callFake((id: number) => makeProduct(id));

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [WishlistSidebar],
      providers: [
        { provide: WishlistService, useValue: wishlistSpy },
        { provide: ProductService, useValue: productSpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .overrideComponent(WishlistSidebar, {
        set: { imports: [CommonModule] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WishlistSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── isOpen ────────────────────────────────────────────────────────────────

  it('isOpen is false initially', () => {
    expect(component.isOpen).toBeFalse();
  });

  it('isOpen becomes true when sidebar opens', () => {
    sidebarOpenSubject.next(true);
    fixture.detectChanges();
    expect(component.isOpen).toBeTrue();
  });

  it('isOpen reverts to false when sidebar closes', () => {
    sidebarOpenSubject.next(true);
    sidebarOpenSubject.next(false);
    fixture.detectChanges();
    expect(component.isOpen).toBeFalse();
  });

  // ── products list ─────────────────────────────────────────────────────────

  it('products is empty initially', () => {
    expect(component.products.length).toBe(0);
  });

  it('products is populated when ids are emitted', () => {
    idsSubject.next([1, 2]);
    fixture.detectChanges();
    expect(component.products.length).toBe(2);
  });

  it('calls productService.getById for each wishlisted id', () => {
    idsSubject.next([5, 10]);
    fixture.detectChanges();
    expect(productSpy.getById).toHaveBeenCalledWith(5);
    expect(productSpy.getById).toHaveBeenCalledWith(10);
  });

  it('filters out undefined products from getById', () => {
    productSpy.getById.and.callFake((id: number) => id === 1 ? makeProduct(1) : undefined);
    idsSubject.next([1, 99]);
    fixture.detectChanges();
    expect(component.products.length).toBe(1);
    expect(component.products[0].id).toBe(1);
  });

  // ── close ─────────────────────────────────────────────────────────────────

  it('close calls wishlistService.closeSidebar', () => {
    component.close();
    expect(wishlistSpy.closeSidebar).toHaveBeenCalled();
  });

  // ── remove ────────────────────────────────────────────────────────────────

  it('remove calls wishlistService.toggle with the product id', () => {
    component.remove(7);
    expect(wishlistSpy.toggle).toHaveBeenCalledWith(7);
  });

  // ── navigate ──────────────────────────────────────────────────────────────

  it('navigate closes the sidebar and routes to path', () => {
    component.navigate('/shop');
    expect(wishlistSpy.closeSidebar).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/shop']);
  });

  // ── fmt ───────────────────────────────────────────────────────────────────

  it('fmt delegates to productService.formatPrice', () => {
    const result = component.fmt(250000);
    expect(productSpy.formatPrice).toHaveBeenCalledWith(250000);
    expect(result).toBe('Rp 250000');
  });
});
