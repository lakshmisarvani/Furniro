import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { Navbar } from './navbar';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CartItem } from '../../services/cart';

describe('Navbar', () => {
  let fixture: ComponentFixture<Navbar>;
  let component: Navbar;
  let cartSpy: jasmine.SpyObj<CartService>;
  let wishlistSpy: jasmine.SpyObj<WishlistService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const itemsSubject = new BehaviorSubject<CartItem[]>([]);
  const wishlistIdsSubject = new BehaviorSubject<number[]>([]);

  const mockUser: AuthUser = { id: '1', name: 'Test User', email: 'test@test.com' };

  beforeEach(async () => {
    cartSpy = jasmine.createSpyObj('CartService', ['toggleSidebar', 'openSidebar', 'closeSidebar'], {
      items$: itemsSubject.asObservable(),
      sidebarOpen$: new BehaviorSubject<boolean>(false).asObservable(),
    });

    wishlistSpy = jasmine.createSpyObj('WishlistService', ['toggleSidebar', 'openSidebar', 'closeSidebar'], {
      ids$: wishlistIdsSubject.asObservable(),
      sidebarOpen$: new BehaviorSubject<boolean>(false).asObservable(),
    });

    authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getUser', 'logout']);
    authSpy.isLoggedIn.and.returnValue(false);
    authSpy.getUser.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [Navbar, RouterTestingModule],
      providers: [
        { provide: CartService, useValue: cartSpy },
        { provide: WishlistService, useValue: wishlistSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    })
      .overrideComponent(Navbar, {
        set: { imports: [CommonModule, RouterTestingModule] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initialises cartCount to 0 with empty cart', () => {
    expect(component.cartCount).toBe(0);
  });

  it('updates cartCount when items change', () => {
    const mockProduct = { id: 1, name: 'Chair', subtitle: '', price: 100, image: '', category: '' };
    itemsSubject.next([{ product: mockProduct, quantity: 3 }]);
    fixture.detectChanges();
    expect(component.cartCount).toBe(3);
  });

  it('updates wishlistCount when ids change', () => {
    wishlistIdsSubject.next([1, 2, 3]);
    fixture.detectChanges();
    expect(component.wishlistCount).toBe(3);
  });

  it('isLoggedIn returns false when not authenticated', () => {
    expect(component.isLoggedIn).toBeFalse();
  });

  it('isLoggedIn returns true when authenticated', () => {
    authSpy.isLoggedIn.and.returnValue(true);
    expect(component.isLoggedIn).toBeTrue();
  });

  it('currentUser is null when not logged in', () => {
    expect(component.currentUser).toBeNull();
  });

  it('currentUser is set on init when logged in', async () => {
    authSpy.getUser.and.returnValue(mockUser);
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('openCart calls cartService.toggleSidebar', () => {
    component.openCart();
    expect(cartSpy.toggleSidebar).toHaveBeenCalled();
  });

  it('openWishlist calls wishlistService.toggleSidebar', () => {
    component.openWishlist();
    expect(wishlistSpy.toggleSidebar).toHaveBeenCalled();
  });

  it('toggleUserMenu flips userMenuOpen', () => {
    expect(component.userMenuOpen).toBeFalse();
    component.toggleUserMenu();
    expect(component.userMenuOpen).toBeTrue();
    component.toggleUserMenu();
    expect(component.userMenuOpen).toBeFalse();
  });

  it('closeUserMenu sets userMenuOpen to false', () => {
    component.userMenuOpen = true;
    component.closeUserMenu();
    expect(component.userMenuOpen).toBeFalse();
  });

  it('logout calls authService.logout', () => {
    component.logout();
    expect(authSpy.logout).toHaveBeenCalled();
  });

  it('logout clears currentUser', () => {
    component.currentUser = mockUser;
    component.logout();
    expect(component.currentUser).toBeNull();
  });

  it('logout closes user menu', () => {
    component.userMenuOpen = true;
    component.logout();
    expect(component.userMenuOpen).toBeFalse();
  });

  it('logout navigates to home', () => {
    component.logout();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('sums multiple cart item quantities into cartCount', () => {
    const mockProduct = { id: 1, name: 'Chair', subtitle: '', price: 100, image: '', category: '' };
    const mockProduct2 = { id: 2, name: 'Table', subtitle: '', price: 200, image: '', category: '' };
    itemsSubject.next([
      { product: mockProduct, quantity: 2 },
      { product: mockProduct2, quantity: 5 },
    ]);
    fixture.detectChanges();
    expect(component.cartCount).toBe(7);
  });
});
