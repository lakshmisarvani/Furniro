import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProductService } from '../../services/product';
import { Product } from '../models/models';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { ComparisonService } from '../../services/comparison';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard implements OnInit {
  @Input() product!: Product;

  hovered = false;
  isWishlisted = false;
  isComparing = false;
  addedToCart = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private comparisonService: ComparisonService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.wishlistService.ids$.subscribe(ids => {
      this.isWishlisted = ids.includes(this.product.id);
    });
    this.comparisonService.ids$.subscribe(ids => {
      this.isComparing = ids.includes(this.product.id);
    });
  }

  addToCart(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addToCart(this.product, 1);
    this.addedToCart = true;
    setTimeout(() => (this.addedToCart = false), 1500);
  }

  toggleWishlist(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.wishlistService.toggle(this.product.id, this.product);
  }

  toggleCompare(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.comparisonService.toggle(this.product.id);
  }

  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }
}
