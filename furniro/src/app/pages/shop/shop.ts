import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { Product } from '../../components/models/models';
import { ProductCard } from '../../components/product-card/product-card';
import { Breadcrumb, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { ServiceFeatures } from '../../components/service-features/service-features';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule, ProductCard, Breadcrumb, ServiceFeatures],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Shop' },
  ];

  private allProducts: Product[] = [];
  displayedProducts: Product[] = [];

  // Keep as number always — use +val coercion on every assignment
  showCount = 16;
  sortBy = 'default';
  currentPage = 1;
  totalPages = 1;

  viewMode: 'grid4' | 'grid3' = 'grid4';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.allProducts = this.productService.getAll();
    this.updateDisplay();
  }

  // Called by (change) on the Show select — always converts to number
  onShowCountChange(rawVal: string): void {
    this.showCount = +rawVal;   // "8" → 8, "16" → 16, "32" → 32
    this.currentPage = 1;
    this.updateDisplay();
  }

  // Called by (change) on the Sort select
  onSortChange(): void {
    this.currentPage = 1;
    this.updateDisplay();
  }

  updateDisplay(): void {
    const count = +this.showCount; // guard against any stray string

    let sorted = [...this.allProducts];
    if (this.sortBy === 'price-asc')  sorted.sort((a, b) => a.price - b.price);
    if (this.sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (this.sortBy === 'name')       sorted.sort((a, b) => a.name.localeCompare(b.name));

    this.totalPages = Math.max(1, Math.ceil(sorted.length / count));

    // Clamp currentPage — handles the case where changing showCount reduces pages
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * count;
    this.displayedProducts = sorted.slice(start, start + count);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.updateDisplay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Template helpers ──────────────────────────────────────

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get totalCount(): number {
    return this.allProducts.length;
  }

  get showingText(): string {
    if (this.totalCount === 0) return 'No products found';
    const count  = +this.showCount;
    const start  = (this.currentPage - 1) * count + 1;
    const end    = Math.min(this.currentPage * count, this.totalCount);
    return `Showing ${start}–${end} of ${this.totalCount} results`;
  }
}
