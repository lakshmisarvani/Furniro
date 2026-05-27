import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Home } from './home';
import { ProductService } from '../../services/product';
import { Product } from '../../components/models/models';

// ── Stubs ─────────────────────────────────────────────────────────────────────

@Component({ selector: 'app-product-card', template: '', standalone: true })
class StubProductCard { @Input() product!: Product; }

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeProduct = (id: number): Product => ({
  id,
  name: `Product ${id}`,
  subtitle: `Sub ${id}`,
  price: id * 1000,
  image: `img${id}.jpg`,
  category: 'Furniture',
});

const MOCK_PRODUCTS = Array.from({ length: 10 }, (_, i) => makeProduct(i + 1));
const MOCK_ROOM_SLIDES = [
  { id: 1, room: '01 — Bed Room',     title: 'Inner Peace',      image: 'assets/images/bedroom.png' },
  { id: 2, room: '02 — Living Room',  title: 'Modern Serenity',  image: 'assets/images/living.png'  },
  { id: 3, room: '03 — Dining Room',  title: 'Warm Gatherings',  image: 'assets/images/dining.png'  },
  { id: 4, room: '04 — Home Office',  title: 'Focused Calm',     image: 'assets/images/pingky.png'  },
];

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let component: Home;
  let productSpy: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    productSpy = jasmine.createSpyObj('ProductService', ['getFeatured', 'getAll', 'formatPrice'], {
      roomSlides: MOCK_ROOM_SLIDES,
    });
    productSpy.getFeatured.and.returnValue(MOCK_PRODUCTS);
    productSpy.formatPrice.and.callFake((p: number) => `Rp ${p}`);

    await TestBed.configureTestingModule({
      imports: [Home, RouterTestingModule],
      providers: [{ provide: ProductService, useValue: productSpy }],
    })
      .overrideComponent(Home, {
        set: { imports: [CommonModule, RouterTestingModule, StubProductCard] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.stopAutoplay();
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    expect(component).toBeTruthy();
  }));

  it('loads featured products on init', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    expect(productSpy.getFeatured).toHaveBeenCalled();
  }));

  it('products are sliced to displayCount (8) on init', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    expect(component.products.length).toBe(8);
  }));

  it('roomSlides are loaded from productService', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    expect(component.roomSlides).toEqual(MOCK_ROOM_SLIDES);
  }));

  it('currentSlide starts at 0', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    expect(component.currentSlide).toBe(0);
  }));

  it('nextSlide increments currentSlide', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    component.nextSlide();
    expect(component.currentSlide).toBe(1);
  }));

  it('nextSlide wraps around to 0 after last slide', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    component.currentSlide = MOCK_ROOM_SLIDES.length - 1;
    component.nextSlide();
    expect(component.currentSlide).toBe(0);
  }));

  it('prevSlide decrements currentSlide', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    component.currentSlide = 2;
    component.prevSlide();
    expect(component.currentSlide).toBe(1);
  }));

  it('prevSlide wraps to last slide from 0', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    component.currentSlide = 0;
    component.prevSlide();
    expect(component.currentSlide).toBe(MOCK_ROOM_SLIDES.length - 1);
  }));

  it('goToSlide sets currentSlide to given index', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    component.goToSlide(2);
    expect(component.currentSlide).toBe(2);
  }));

  it('autoplay advances slide after 4 seconds', fakeAsync(() => {
    fixture.detectChanges();
    tick(4000);
    expect(component.currentSlide).toBe(1);
    discardPeriodicTasks();
  }));

  it('stopAutoplay prevents further slide advances', fakeAsync(() => {
    fixture.detectChanges();
    component.stopAutoplay();
    tick(8000);
    expect(component.currentSlide).toBe(0);
  }));

  it('showMore adds 4 more products', fakeAsync(() => {
    productSpy.getFeatured.and.returnValue(MOCK_PRODUCTS);
    fixture.detectChanges();
    discardPeriodicTasks();
    component.showMore();
    expect(component.displayCount).toBe(12);
  }));

  it('displayCount starts at 8', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    expect(component.displayCount).toBe(8);
  }));

  it('categories has 3 items', fakeAsync(() => {
    fixture.detectChanges();
    discardPeriodicTasks();
    expect(component.categories.length).toBe(3);
  }));

  it('ngOnDestroy calls stopAutoplay', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component, 'stopAutoplay');
    component.ngOnDestroy();
    expect(component.stopAutoplay).toHaveBeenCalled();
    discardPeriodicTasks();
  }));
});
