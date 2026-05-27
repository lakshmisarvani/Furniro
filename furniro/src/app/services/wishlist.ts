import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../components/models/models';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

const WISHLIST_KEY = 'furniro_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private idsSubject = new BehaviorSubject<number[]>(this.load());
  readonly ids$ = this.idsSubject.asObservable();

  private sidebarOpenSubject = new BehaviorSubject<boolean>(false);
  readonly sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  private load(): number[] {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]'); }
    catch { return []; }
  }

  private save(ids: number[]) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    this.idsSubject.next(ids);
  }

  get ids(): number[] { return this.idsSubject.getValue(); }
  get count(): number { return this.ids.length; }

  isWishlisted(id: number): boolean { return this.ids.includes(id); }

  toggle(id: number, product?: Product) {
    const current = this.ids;
    const updated = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    this.save(updated);

    if (this.authService.isLoggedIn() && product) {
      this.apiService.toggleWishlist({
        productId: String(id),
        name: product.name,
        price: product.price,
        image: product.image,
      }).subscribe({ error: () => {} });
    }
  }

  syncToBackend(products: Product[]) {
    if (!this.authService.isLoggedIn()) return;
    const items = products.map(p => ({
      productId: String(p.id),
      name: p.name,
      price: p.price,
      image: p.image,
    }));
    this.apiService.syncWishlist(items).subscribe({ error: () => {} });
  }

  openSidebar() { this.sidebarOpenSubject.next(true); }
  closeSidebar() { this.sidebarOpenSubject.next(false); }
  toggleSidebar() { this.sidebarOpenSubject.next(!this.sidebarOpenSubject.getValue()); }
}
