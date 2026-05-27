import { Component, OnInit, OnDestroy,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';
import { Product, RoomSlide} from '../../components/models/models';
import { ProductCard } from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
   categories = [
  //   { name: 'Dining', image: 'https://picsum.photos/seed/dining/450/350' },
  //   { name: 'Living', image: 'https://picsum.photos/seed/living/450/350' },
  //   { name: 'Bedroom', image: 'https://picsum.photos/seed/bedroom/450/350' },
     {name: 'Dining', image: 'assets/images/dining.png' },
       {name: 'Living', image: 'assets/images/living.png' },
    { name: 'Bedroom', image: 'assets/images/room1.png' }
  ];

  products: Product[] = [];

  roomSlides: RoomSlide[] = [];
  currentSlide = 0;
  private slideTimer: ReturnType<typeof setInterval> | null = null;

  // instagramImages = [
  //   { src: 'https://cdn.corenexis.com/files/c/5796745720.png', tall: false },
  //   { src: 'https://picsum.photos/seed/insta2/400/500', tall: true },
  //   { src: 'https://picsum.photos/seed/insta3/400/350', tall: false },
  //   { src: 'https://picsum.photos/seed/insta4/400/480', tall: true },
  //   { src: 'https://picsum.photos/seed/insta5/400/400', tall: false },
  //   { src: 'https://picsum.photos/seed/insta6/400/320', tall: false },
  //   { src: 'https://picsum.photos/seed/insta7/400/460', tall: true },
  //   { src: 'https://picsum.photos/seed/insta8/400/380', tall: false },
  //   { src: 'https://picsum.photos/seed/insta9/400/420', tall: false },
  // ];

leftTop = signal(['assets/images/ff1.png', 'assets/images/ff2.png']);
  leftBottom = signal(['assets/images/ff6.png', 'assets/images/ff4.png']);
  
  centerImg = signal('assets/images/ff5.png');

  rightTop = signal(['assets/images/ff4.png', 'assets/images/ff7.png']);
  rightBottom = signal(['assets/images/ff8.png', 'assets/images/ff9.png']);
  constructor(private productService: ProductService) {}
 displayCount=8;
  ngOnInit() {
    this.products = this.productService.getFeatured().slice(0,this.displayCount);
    this.roomSlides = this.productService.roomSlides;
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.slideTimer = setInterval(() => this.nextSlide(), 4000);
  }

  stopAutoplay() {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.slideTimer = null;
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.roomSlides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.roomSlides.length) % this.roomSlides.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }
 showMore() {
  const allProducts = this.productService.getFeatured();

  const newProducts: Product[] = [];

  for (let i = 0; i < this.displayCount + 4; i++) {
    newProducts.push(allProducts[i % allProducts.length]);
  }

  this.displayCount += 4;
  this.products = newProducts;
}

  
}

