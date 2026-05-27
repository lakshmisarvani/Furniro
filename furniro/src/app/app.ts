import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { CartSidebar } from './components/cart-sidebar/cart-sidebar';
import { WishlistSidebar } from './components/wishlist-sidebar/wishlist-sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, CartSidebar, WishlistSidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
