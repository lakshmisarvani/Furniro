import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartSidebar } from './cart-sidebar';
import { CartService, CartItem } from '../../services/cart';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';
import productsData from '../../data/product.json';
import { Product } from '../models/models';
const products: Product[] = productsData as Product[];

describe('CartSidebar', () => {
  let component: CartSidebar;
  let fixture: ComponentFixture<CartSidebar>;

  let sidebarOpenSubject: BehaviorSubject<boolean>;
  let itemsSubject: BehaviorSubject<CartItem[]>;

  let mockCartService: jasmine.SpyObj<CartService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockItems: CartItem[] = [
  {
    quantity: 2,
    product: products[0],
  },
  {
    quantity: 1,
    product: products[1],
  },
];

  beforeEach(async () => {
    sidebarOpenSubject = new BehaviorSubject<boolean>(true);
    itemsSubject = new BehaviorSubject<CartItem[]>(mockItems);

    mockCartService = jasmine.createSpyObj(
      'CartService',
      [
        'closeSidebar',
        'removeFromCart',
        'formatPrice',
      ],
      {
        sidebarOpen$: sidebarOpenSubject.asObservable(),
        items$: itemsSubject.asObservable(),
        subtotal: 450,
      }
    );

    mockCartService.formatPrice.and.callFake(
      (price: number) => `$${price}`
    );

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CartSidebar, RouterTestingModule],
      providers: [
        { provide: CartService, useValue: mockCartService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartSidebar);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isOpen from sidebarOpen$', () => {
    expect(component.isOpen).toBeTrue();
  });

  it('should initialize items from items$', () => {
    expect(component.items.length).toBe(2);
    expect(component.items[0].product.name).toBe('Chair');
  });

  it('should render cart items', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Chair');
    expect(text).toContain('Table');
  });

  it('should show empty cart message when no items exist', () => {
    itemsSubject.next([]);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('Your cart is empty');
  });

  it('should call closeSidebar when close() is called', () => {
    component.close();

    expect(mockCartService.closeSidebar).toHaveBeenCalled();
  });

  it('should call removeFromCart when remove() is called', () => {
    component.remove(1);

    expect(mockCartService.removeFromCart)
      .toHaveBeenCalledWith(1);
  });

  it('should navigate and close sidebar', () => {
    component.navigate('/cart');

    expect(mockCartService.closeSidebar).toHaveBeenCalled();

    expect(mockRouter.navigate)
      .toHaveBeenCalledWith(['/cart']);
  });

  it('should return subtotal from cart service', () => {
    expect(component.subtotal).toBe(450);
  });

  it('should format price using cart service', () => {
    expect(component.fmt(100)).toBe('$100');

    expect(mockCartService.formatPrice)
      .toHaveBeenCalledWith(100);
  });

  it('should render subtotal section when items exist', () => {
    expect(fixture.nativeElement.textContent)
      .toContain('Subtotal');
  });

  it('should not render subtotal section when cart is empty', () => {
    itemsSubject.next([]);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .not.toContain('Subtotal');
  });

  it('should render correct number of remove buttons', () => {
    const buttons = fixture.debugElement.queryAll(
      By.css('.group button')
    );

    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should apply translate-x-0 class when sidebar is open', () => {
    const sidebar = fixture.debugElement.query(
      By.css('.fixed.top-\\[72px\\]')
    );

    expect(sidebar.nativeElement.className)
      .toContain('translate-x-0');
  });

  it('should apply translate-x-full class when sidebar is closed', () => {
    sidebarOpenSubject.next(false);

    fixture.detectChanges();

    const sidebar = fixture.debugElement.query(
      By.css('.fixed.top-\\[72px\\]')
    );

    expect(sidebar.nativeElement.className)
      .toContain('translate-x-full');
  });
});