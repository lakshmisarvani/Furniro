import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart';
import { Breadcrumb, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { ServiceFeatures } from '../../components/service-features/service-features';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, FormsModule, Breadcrumb, ServiceFeatures],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartPage implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Cart' },
  ];

  items: CartItem[] = [];

  constructor(public cartService: CartService) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => (this.items = items));
  }

  remove(id: number) { this.cartService.removeFromCart(id); }

  updateQty(id: number, qty: number) { this.cartService.updateQuantity(id, qty); }

  get subtotal(): number { return this.cartService.subtotal; }

  fmt(p: number): string { return this.cartService.formatPrice(p); }
}
