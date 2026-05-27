import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { CartPage } from './cart';
import { CartService, CartItem } from '../../services/cart';
import { BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { Product } from '../../components/models/models';

// ── Stubs ─────────────────────────────────────────────────────────────────────

@Component({ selector: 'app-breadcrumb', template: '', standalone: true })
class StubBreadcrumb { @Input() items: BreadcrumbItem[] = []; }

@Component({ selector: 'app-service-features', template: '', standalone: true })
class StubServiceFeatures {}

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeProduct = (id: number, price: number): Product => ({
  id, name: `Product ${id}`, subtitle: '', price, image: '', category: 'Furniture',
});

const makeItem = (id: number, price: number, qty: number): CartItem => ({
  product: makeProduct(id, price), quantity: qty,
});

describe('CartPage', () => {
  let fixture: ComponentFixture<CartPage>;
  let component: CartPage;
  let cartSpy: jasmine.SpyObj<CartService>;
  const itemsSubject = new BehaviorSubject<CartItem[]>([]);

  beforeEach(async () => {
    cartSpy = jasmine.createSpyObj('CartService', ['removeFromCart', 'updateQuantity', 'formatPrice'], {
      items$: itemsSubject.asObservable(),
      subtotal: 0,
    });
    cartSpy.formatPrice.and.callFake((p: number) => `Rs. ${p}`);

    await TestBed.configureTestingModule({
      imports: [CartPage, RouterTestingModule],
      providers: [{ provide: CartService, useValue: cartSpy }],
    })
      .overrideComponent(CartPage, {
        set: { imports: [CommonModule, FormsModule, RouterTestingModule, StubBreadcrumb, StubServiceFeatures] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has correct breadcrumbs', () => {
    expect(component.breadcrumbs[0].label).toBe('Home');
    expect(component.breadcrumbs[1].label).toBe('Cart');
  });

  it('items is empty initially', () => {
    expect(component.items.length).toBe(0);
  });

  it('items updates when cartService emits', () => {
    const items = [makeItem(1, 500, 2)];
    itemsSubject.next(items);
    fixture.detectChanges();
    expect(component.items.length).toBe(1);
  });

  it('items reflects multiple cart items', () => {
    const items = [makeItem(1, 100, 1), makeItem(2, 200, 3)];
    itemsSubject.next(items);
    fixture.detectChanges();
    expect(component.items.length).toBe(2);
  });

  it('remove calls cartService.removeFromCart with correct id', () => {
    component.remove(5);
    expect(cartSpy.removeFromCart).toHaveBeenCalledWith(5);
  });

  it('updateQty calls cartService.updateQuantity', () => {
    component.updateQty(3, 2);
    expect(cartSpy.updateQuantity).toHaveBeenCalledWith(3, 2);
  });

  it('subtotal delegates to cartService', () => {
    Object.defineProperty(cartSpy, 'subtotal', { get: () => 999 });
    expect(component.subtotal).toBe(999);
  });

  it('fmt delegates to cartService.formatPrice', () => {
    const result = component.fmt(12345);
    expect(cartSpy.formatPrice).toHaveBeenCalledWith(12345);
    expect(result).toBe('Rs. 12345');
  });

  it('subscribes to items$ on init', () => {
    const items = [makeItem(10, 750, 1)];
    itemsSubject.next(items);
    fixture.detectChanges();
    expect(component.items[0].product.id).toBe(10);
  });
});
