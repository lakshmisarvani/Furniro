import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';

import { Product } from '../../components/models/models';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { ComparisonService } from '../../services/comparison';
import { ProductCard } from '../../components/product-card/product-card';
import { Breadcrumb, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { ServiceFeatures } from '../../components/service-features/service-features';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, ProductCard, Breadcrumb, ServiceFeatures],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product: Product | undefined;
  relatedProducts: Product[] = [];
  breadcrumbs: BreadcrumbItem[] = [];

  selectedImage = 0;
  selectedSize = '';
  selectedColor = '';
  quantity = 1;
  activeTab: 'description' | 'additional' | 'reviews' = 'description';

  tabs: Array<{ key: 'description' | 'additional' | 'reviews'; label: string }> = [
    { key: 'description', label: 'Description' },
    { key: 'additional', label: 'Additional Information' },
    { key: 'reviews', label: 'Reviews' },
  ];

  isWishlisted = false;
  addedToCart = false;
  isComparing = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private comparisonService: ComparisonService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.product = this.productService.getById(id);
      if (this.product) {
        this.relatedProducts = this.productService.getRelated(id, 4);
        this.breadcrumbs = [
          { label: 'Home', link: '/' },
          { label: 'Shop', link: '/shop' },
          { label: this.product.name },
        ];
        this.selectedSize = this.product.sizes?.[0] ?? '';
        this.selectedColor = this.product.colors?.[0] ?? '';
        this.selectedImage = 0;
        this.isWishlisted = this.wishlistService.isWishlisted(id);
        this.isComparing = this.comparisonService.isComparing(id);
      }
    });
    this.wishlistService.ids$.subscribe(() => {
      if (this.product) this.isWishlisted = this.wishlistService.isWishlisted(this.product.id);
    });
    this.comparisonService.ids$.subscribe(() => {
      if (this.product) this.isComparing = this.comparisonService.isComparing(this.product.id);
    });
  }

  get currentImage(): string {
    if (!this.product) return '';
    return this.product.images?.[this.selectedImage] ?? this.product.image;
  }

  changeQty(delta: number) {
    this.quantity = Math.max(1, this.quantity + delta);
  }

  addToCart() {
    if (!this.product) return;
    this.cartService.addToCart(this.product, this.quantity);
    this.addedToCart = true;
    setTimeout(() => (this.addedToCart = false), 1500);
  }

  toggleWishlist() {
    if (this.product) this.wishlistService.toggle(this.product.id);
  }

  toggleCompare() {
    if (this.product) {
      this.comparisonService.toggle(this.product.id);
      if (!this.isComparing) this.comparisonService.navigateToCompare();
    }
  }

  stars(rating: number = 0): number[] {
    return Array.from({ length: 5 }, (_, i) => i);
  }

  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }
}
