import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../components/models/models';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_KEY = 'furniro_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.load());
  readonly items$ = this.itemsSubject.asObservable();

  private sidebarOpenSubject = new BehaviorSubject<boolean>(false);
  readonly sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    } catch { return []; }
  }

  private save(items: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  private syncToBackend(items: CartItem[]) {
    if (!this.authService.isLoggedIn()) return;
    const backendItems = items.map(i => ({
      productId: String(i.product.id),
      name: i.product.name,
      price: i.product.price,
      image: i.product.image,
      quantity: i.quantity,
    }));
    this.apiService.syncCart(backendItems).subscribe({ error: () => {} });
  }

  get items(): CartItem[] { return this.itemsSubject.getValue(); }

  get count(): number { return this.items.reduce((s, i) => s + i.quantity, 0); }

  get subtotal(): number {
    return this.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  }

  addToCart(product: Product, quantity = 1) {
    const current = this.items;
    const idx = current.findIndex(i => i.product.id === product.id);
    let updated: CartItem[];
    if (idx >= 0) {
      updated = current.map((item, i) =>
        i === idx ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [...current, { product, quantity }];
    }
    this.save(updated);
    this.syncToBackend(updated);
    this.openSidebar();
  }

  removeFromCart(productId: number) {
    const updated = this.items.filter(i => i.product.id !== productId);
    this.save(updated);
    this.syncToBackend(updated);
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity < 1) { this.removeFromCart(productId); return; }
    const updated = this.items.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    this.save(updated);
    this.syncToBackend(updated);
  }

  clearCart() {
    this.save([]);
    if (this.authService.isLoggedIn()) {
      this.apiService.clearCart().subscribe({ error: () => {} });
    }
  }

  loadFromBackend() {
    if (!this.authService.isLoggedIn()) return;
    this.apiService.getCart().subscribe({
      next: (res) => {
        if (res.success && res.data?.cart?.items?.length) {
          console.log('Cart loaded from backend:', res.data.cart.items.length, 'items');
        }
      },
      error: () => {},
    });
  }

  openSidebar() { this.sidebarOpenSubject.next(true); }
  closeSidebar() { this.sidebarOpenSubject.next(false); }
  toggleSidebar() { this.sidebarOpenSubject.next(!this.sidebarOpenSubject.getValue()); }

  formatPrice(price: number): string {
    return 'Rs. ' + price.toLocaleString('en-IN') + '.00';
  }
}
