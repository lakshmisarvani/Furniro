import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';

@Component({
  selector: 'app-cart-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-sidebar.html',
  styleUrls: ['./cart-sidebar.css'],
})
export class CartSidebar implements OnInit {
  isOpen = false;
  items: CartItem[] = [];

  constructor(public cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.sidebarOpen$.subscribe(open => (this.isOpen = open));
    this.cartService.items$.subscribe(items => (this.items = items));
  }

  close() { this.cartService.closeSidebar(); }

  remove(id: number) { this.cartService.removeFromCart(id); }

  navigate(path: string) {
    this.close();
    this.router.navigate([path]);
  }

  get subtotal(): number { return this.cartService.subtotal; }

  fmt(price: number): string { return this.cartService.formatPrice(price); }
}
