import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart';
import { Breadcrumb, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { ServiceFeatures } from '../../components/service-features/service-features';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink, FormsModule, Breadcrumb, ServiceFeatures],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Checkout' },
  ];

  items: CartItem[] = [];
  paymentMethod = 'bank';
  orderPlaced = false;

  billing = {
    firstName: '', lastName: '', company: '',
    country: '', street: '', city: '',
    province: '', zip: '', phone: '', email: '',
    additionalInfo: '',
  };

  constructor(public cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.items$.subscribe(i => (this.items = i));
  }

  get subtotal(): number { return this.cartService.subtotal; }

  fmt(p: number): string { return this.cartService.formatPrice(p); }

  isFormValid(): boolean {
    const b = this.billing;
    return !!(b.firstName && b.lastName && b.country && b.street && b.city && b.zip && b.phone && b.email);
  }

  placeOrder() {
    if (!this.isFormValid() || this.items.length === 0) return;
    this.orderPlaced = true;
    this.cartService.clearCart();
    setTimeout(() => this.router.navigate(['/']), 3000);
  }
}
