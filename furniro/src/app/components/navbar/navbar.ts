import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  cartCount = 0;
  wishlistCount = 0;
  currentUser: AuthUser | null = null;
  userMenuOpen = false;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items =>
      this.cartCount = items.reduce((s, i) => s + i.quantity, 0)
    );
    this.wishlistService.ids$.subscribe(ids => this.wishlistCount = ids.length);
    this.currentUser = this.authService.getUser();
  }

  get isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  openCart() { this.cartService.toggleSidebar(); }
  openWishlist() { this.wishlistService.toggleSidebar(); }

  toggleUserMenu() { this.userMenuOpen = !this.userMenuOpen; }
  closeUserMenu() { this.userMenuOpen = false; }

  logout() {
    this.authService.logout();
    this.currentUser = null;
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }
}
