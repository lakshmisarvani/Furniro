import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../services/wishlist';
import { ProductService} from '../../services/product';
import { Product } from '../models/models';

@Component({
  selector: 'app-wishlist-sidebar',
  imports: [CommonModule],
  templateUrl: './wishlist-sidebar.html',
  styleUrl: './wishlist-sidebar.css',
})
export class WishlistSidebar implements OnInit {
  isOpen = false;
  products: Product[] = [];

  constructor(
    private wishlistService: WishlistService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.wishlistService.sidebarOpen$.subscribe(open => (this.isOpen = open));
    this.wishlistService.ids$.subscribe(ids => {
      this.products = ids
        .map(id => this.productService.getById(id))
        .filter((p): p is Product => !!p);
    });
  }

  close() { this.wishlistService.closeSidebar(); }

  remove(id: number) { this.wishlistService.toggle(id); }

  navigate(path: string) {
    this.close();
    this.router.navigate([path]);
  }

  fmt(price: number): string { return this.productService.formatPrice(price); }
}
