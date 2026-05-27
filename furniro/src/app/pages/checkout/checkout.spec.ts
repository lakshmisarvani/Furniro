import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { Checkout } from './checkout';
import { CartService, CartItem } from '../../services/cart';
import { BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { Router } from '@angular/router';
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

const makeItem = (id: number, price: number, qty = 1): CartItem => ({
  product: makeProduct(id, price), quantity: qty,
});

describe('Checkout', () => {
  let fixture: ComponentFixture<Checkout>;
  let component: Checkout;
  let cartSpy: jasmine.SpyObj<CartService>;
  let router: Router;
  const itemsSubject = new BehaviorSubject<CartItem[]>([]);

  beforeEach(async () => {
    cartSpy = jasmine.createSpyObj('CartService', ['clearCart', 'formatPrice'], {
      items$: itemsSubject.asObservable(),
      subtotal: 0,
    });
    cartSpy.formatPrice.and.callFake((p: number) => `Rs. ${p}`);

    await TestBed.configureTestingModule({
      imports: [Checkout, RouterTestingModule],
      providers: [{ provide: CartService, useValue: cartSpy }],
    })
      .overrideComponent(Checkout, {
        set: { imports: [CommonModule, FormsModule, RouterTestingModule, StubBreadcrumb, StubServiceFeatures] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(Checkout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has correct breadcrumbs', () => {
    expect(component.breadcrumbs[0].label).toBe('Home');
    expect(component.breadcrumbs[1].label).toBe('Checkout');
  });

  it('items is empty initially', () => {
    expect(component.items.length).toBe(0);
  });

  it('items updates when cartService emits', () => {
    itemsSubject.next([makeItem(1, 100)]);
    fixture.detectChanges();
    expect(component.items.length).toBe(1);
  });

  it('orderPlaced is false initially', () => {
    expect(component.orderPlaced).toBeFalse();
  });

  it('paymentMethod defaults to bank', () => {
    expect(component.paymentMethod).toBe('bank');
  });

  // ── isFormValid ───────────────────────────────────────────────────────────

  it('isFormValid returns false when billing fields are empty', () => {
    expect(component.isFormValid()).toBeFalse();
  });

  it('isFormValid returns true when all required fields are filled', () => {
    component.billing = {
      firstName: 'John', lastName: 'Doe', company: '',
      country: 'Indonesia', street: '123 Main St', city: 'Jakarta',
      province: 'DKI', zip: '12345', phone: '08123456789',
      email: 'john@test.com', additionalInfo: '',
    };
    expect(component.isFormValid()).toBeTrue();
  });

  it('isFormValid returns false when email is missing', () => {
    component.billing = {
      firstName: 'John', lastName: 'Doe', company: '',
      country: 'Indonesia', street: '123 Main St', city: 'Jakarta',
      province: '', zip: '12345', phone: '08123456789',
      email: '', additionalInfo: '',
    };
    expect(component.isFormValid()).toBeFalse();
  });

  // ── placeOrder ────────────────────────────────────────────────────────────

  it('placeOrder does nothing when form is invalid', () => {
    component.placeOrder();
    expect(cartSpy.clearCart).not.toHaveBeenCalled();
    expect(component.orderPlaced).toBeFalse();
  });

  it('placeOrder does nothing when cart is empty', () => {
    component.billing = {
      firstName: 'John', lastName: 'Doe', company: '',
      country: 'Indonesia', street: '123 Main St', city: 'Jakarta',
      province: '', zip: '12345', phone: '08123456789',
      email: 'john@test.com', additionalInfo: '',
    };
    component.items = [];
    component.placeOrder();
    expect(cartSpy.clearCart).not.toHaveBeenCalled();
  });

  it('placeOrder sets orderPlaced to true on success', () => {
    component.billing = {
      firstName: 'John', lastName: 'Doe', company: '',
      country: 'Indonesia', street: '123 Main St', city: 'Jakarta',
      province: '', zip: '12345', phone: '08123456789',
      email: 'john@test.com', additionalInfo: '',
    };
    itemsSubject.next([makeItem(1, 100)]);
    component.items = [makeItem(1, 100)];
    component.placeOrder();
    expect(component.orderPlaced).toBeTrue();
  });

  it('placeOrder calls cartService.clearCart', () => {
    component.billing = {
      firstName: 'John', lastName: 'Doe', company: '',
      country: 'Indonesia', street: '123 Main St', city: 'Jakarta',
      province: '', zip: '12345', phone: '08123456789',
      email: 'john@test.com', additionalInfo: '',
    };
    component.items = [makeItem(1, 100)];
    component.placeOrder();
    expect(cartSpy.clearCart).toHaveBeenCalled();
  });

  it('placeOrder navigates to home after 3 seconds', fakeAsync(() => {
    component.billing = {
      firstName: 'John', lastName: 'Doe', company: '',
      country: 'Indonesia', street: '123 Main St', city: 'Jakarta',
      province: '', zip: '12345', phone: '08123456789',
      email: 'john@test.com', additionalInfo: '',
    };
    component.items = [makeItem(1, 100)];
    component.placeOrder();
    tick(3000);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  // ── fmt / subtotal ────────────────────────────────────────────────────────

  it('fmt delegates to cartService.formatPrice', () => {
    const result = component.fmt(75000);
    expect(cartSpy.formatPrice).toHaveBeenCalledWith(75000);
    expect(result).toBe('Rs. 75000');
  });

  it('subtotal delegates to cartService', () => {
    Object.defineProperty(cartSpy, 'subtotal', { get: () => 500 });
    expect(component.subtotal).toBe(500);
  });
});
