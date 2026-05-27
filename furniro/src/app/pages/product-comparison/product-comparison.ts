import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {ProductService } from '../../services/product';
import { Product,ProductSpecs,CompareRow,CompareSection} from '../../components/models/models';
import { ComparisonService } from '../../services/comparison';
import { CartService } from '../../services/cart';
import { Breadcrumb, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { ServiceFeatures } from '../../components/service-features/service-features';
import compareData from '../../data/compareData.json';

@Component({
  selector: 'app-product-comparison',
  imports: [CommonModule, RouterLink, Breadcrumb, ServiceFeatures],
  templateUrl: './product-comparison.html',
  styleUrl: './product-comparison.css',
})
export class ProductComparison implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Comparison' },
  ];

  compareProducts: Product[] = [];
  allProducts: Product[] = [];
  showProductPicker = false;
  addedProductId: number | null = null;

  sections: CompareSection[] = compareData as CompareSection[];

  constructor(
    private productService: ProductService,
    private comparisonService: ComparisonService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.allProducts = this.productService.getAll();
    this.comparisonService.ids$.subscribe(ids => {
      this.compareProducts = ids
        .map(id => this.productService.getById(id))
        .filter((p): p is Product => !!p);
    });
  }

  getSpecs(product: Product): ProductSpecs {
    return this.productService.getSpecs(product);
  }

  getValue(product: Product, key: keyof ProductSpecs): string {
    return this.getSpecs(product)[key];
  }

  remove(id: number) { this.comparisonService.remove(id); }

  addProduct(id: number) {
    this.comparisonService.add(id);
    this.showProductPicker = false;
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product, 1);
  }

  get availableToAdd(): Product[] {
    const currentIds = this.compareProducts.map(p => p.id);
    return this.allProducts.filter(p => !currentIds.includes(p.id));
  }

  starsArr(rating = 0): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }

  fmt(price: number): string { return this.cartService.formatPrice(price); }
}
