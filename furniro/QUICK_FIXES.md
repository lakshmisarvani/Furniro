# 🔧 QUICK ACTION ITEMS & CODE FIXES

## Priority 1: Critical Issues (Fix Immediately)

### 1. Memory Leaks - Fix Navbar Component
**File:** `src/app/components/navbar/navbar.ts`

```typescript
// ❌ BEFORE (Memory leak)
import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  cartCount = 0;
  wishlistCount = 0;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items =>
      this.cartCount = items.reduce((s, i) => s + i.quantity, 0)
    );
    this.wishlistService.ids$.subscribe(ids => this.wishlistCount = ids.length);
  }
}

// ✅ AFTER (Fixed with takeUntilDestroyed)
import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly cartCount$ = this.cartService.items$.pipe(
    map(items => items.reduce((s, i) => s + i.quantity, 0)),
    takeUntilDestroyed()
  );

  readonly wishlistCount$ = this.wishlistService.ids$.pipe(
    map(ids => ids.length),
    takeUntilDestroyed()
  );

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}
}
```

**Template Update:**
```html
<!-- ❌ BEFORE -->
<span>{{ cartCount }}</span>
<span>{{ wishlistCount }}</span>

<!-- ✅ AFTER (use async pipe) -->
<span>{{ cartCount$ | async }}</span>
<span>{{ wishlistCount$ | async }}</span>
```

---

### 2. Unit Tests - Create CartService Tests
**New File:** `src/app/services/cart.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cart.service';
import { Product } from '../components/models/models';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService],
    });
    service = TestBed.inject(CartService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Core Functionality', () => {
    const mockProduct: Product = {
      id: 1,
      name: 'Test Chair',
      price: 100,
      image: 'test.jpg',
      category: 'Chair',
      subtitle: 'Comfortable chair'
    };

    it('should create service', () => {
      expect(service).toBeTruthy();
    });

    it('should add product to empty cart', () => {
      service.addToCart(mockProduct, 1);
      expect(service.count).toBe(1);
      expect(service.items[0].product.id).toBe(1);
    });

    it('should increment quantity if product already in cart', () => {
      service.addToCart(mockProduct, 1);
      service.addToCart(mockProduct, 2);
      expect(service.count).toBe(3);
      expect(service.items[0].quantity).toBe(3);
    });

    it('should remove product from cart', () => {
      service.addToCart(mockProduct, 1);
      service.removeFromCart(1);
      expect(service.count).toBe(0);
    });

    it('should update quantity', () => {
      service.addToCart(mockProduct, 1);
      service.updateQuantity(1, 5);
      expect(service.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity becomes 0', () => {
      service.addToCart(mockProduct, 1);
      service.updateQuantity(1, 0);
      expect(service.items.length).toBe(0);
    });

    it('should clear cart', () => {
      service.addToCart(mockProduct, 1);
      service.clearCart();
      expect(service.items.length).toBe(0);
    });
  });

  describe('Persistence', () => {
    it('should persist cart to localStorage', () => {
      const product: Product = {
        id: 1,
        name: 'Chair',
        price: 100,
        image: 'test.jpg',
        category: 'Chair',
        subtitle: 'Test'
      };

      service.addToCart(product, 1);
      const stored = JSON.parse(localStorage.getItem('furniro_cart') || '[]');
      expect(stored.length).toBe(1);
    });

    it('should load cart from localStorage on init', () => {
      const mockCart: CartItem[] = [{
        product: { id: 1, name: 'Chair', price: 100, image: 'test.jpg', category: 'Chair', subtitle: 'Test' },
        quantity: 2
      }];
      localStorage.setItem('furniro_cart', JSON.stringify(mockCart));

      const newService = TestBed.inject(CartService);
      expect(newService.count).toBe(2);
    });
  });

  describe('Pricing', () => {
    it('should calculate subtotal correctly', () => {
      const product1: Product = { id: 1, name: 'Chair', price: 100, image: 'test.jpg', category: 'Chair', subtitle: 'Test' };
      const product2: Product = { id: 2, name: 'Table', price: 200, image: 'test.jpg', category: 'Table', subtitle: 'Test' };

      service.addToCart(product1, 2);
      service.addToCart(product2, 1);

      expect(service.subtotal).toBe(400);
    });
  });

  describe('Observable Emissions', () => {
    it('should emit items$ when item added', (done) => {
      const product: Product = { id: 1, name: 'Chair', price: 100, image: 'test.jpg', category: 'Chair', subtitle: 'Test' };
      let emissions = 0;

      service.items$.subscribe(items => {
        emissions++;
        if (emissions === 2) { // Initial + added
          expect(items.length).toBe(1);
          done();
        }
      });

      service.addToCart(product, 1);
    });

    it('should emit sidebarOpen$ on toggle', (done) => {
      let emissions = 0;
      service.sidebarOpen$.subscribe(open => {
        emissions++;
        if (emissions === 2) {
          expect(open).toBeFalse(); // Should toggle
          done();
        }
      });

      service.toggleSidebar();
      service.toggleSidebar();
    });
  });
});
```

---

### 3. Form Validation - Update Checkout Component
**File:** `src/app/pages/checkout/checkout.ts`

```typescript
// ❌ BEFORE (No validation)
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({...})
export class Checkout {
  billing = { firstName: '', lastName: '', email: '', /* ... */ };

  isFormValid(): boolean {
    const b = this.billing;
    return !!(b.firstName && b.lastName && b.email && /* ... */);
  }

  placeOrder() {
    if (!this.isFormValid()) return;
    // ...
  }
}

// ✅ AFTER (With Reactive Forms & Validation)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Breadcrumb, ServiceFeatures],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  orderPlaced = false;
  private navigationTimeout: ReturnType<typeof setTimeout> | null = null;

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Checkout' },
  ];

  items: CartItem[] = [];
  paymentMethod = 'bank';

  constructor(
    private fb: FormBuilder,
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.cartService.items$.subscribe(items => (this.items = items));
  }

  ngOnDestroy() {
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }
  }

  private initializeForm() {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, this.phoneValidator()]],
      country: ['', Validators.required],
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      province: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
      company: [''],
      additionalInfo: ['']
    });
  }

  private phoneValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return /^\d{10,}$/.test(control.value) ? null : { invalidPhone: true };
    };
  }

  // Form field getters for template
  get firstName() { return this.checkoutForm.get('firstName'); }
  get lastName() { return this.checkoutForm.get('lastName'); }
  get email() { return this.checkoutForm.get('email'); }
  get phone() { return this.checkoutForm.get('phone'); }
  get street() { return this.checkoutForm.get('street'); }
  get city() { return this.checkoutForm.get('city'); }
  get zip() { return this.checkoutForm.get('zip'); }
  get country() { return this.checkoutForm.get('country'); }
  get province() { return this.checkoutForm.get('province'); }

  get subtotal(): number { return this.cartService.subtotal; }
  fmt(p: number): string { return this.cartService.formatPrice(p); }

  placeOrder() {
    if (!this.checkoutForm.valid || this.items.length === 0) {
      this.markFormAsUntouched();
      return;
    }

    this.orderPlaced = true;
    this.cartService.clearCart();
    this.navigationTimeout = setTimeout(() => this.router.navigate(['/']), 3000);
  }

  private markFormAsUntouched() {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
    });
  }
}
```

**HTML Template Update:**
```html
<!-- ❌ BEFORE -->
<div>
  <label>First Name</label>
  <input [(ngModel)]="billing.firstName" name="firstName" type="text" />
</div>

<!-- ✅ AFTER -->
<div>
  <label for="firstName" class="block text-sm font-medium text-text-dark mb-2">
    First Name
    <span class="text-badge-sale">*</span>
  </label>
  <input 
    id="firstName"
    formControlName="firstName"
    type="text"
    class="w-full border rounded-sm px-4 py-3"
    [ngClass]="firstName?.invalid && firstName?.touched ? 'border-badge-sale' : 'border-border-light'" />
  
  @if (firstName?.invalid && firstName?.touched) {
    <p class="text-badge-sale text-xs mt-1">
      @if (firstName?.errors?.['required']) {
        First name is required
      }
      @if (firstName?.errors?.['minlength']) {
        Minimum 2 characters required
      }
    </p>
  }
</div>

<!-- Email field -->
<div>
  <label for="email" class="block text-sm font-medium text-text-dark mb-2">
    Email Address
    <span class="text-badge-sale">*</span>
  </label>
  <input 
    id="email"
    formControlName="email"
    type="email"
    class="w-full border rounded-sm px-4 py-3"
    [ngClass]="email?.invalid && email?.touched ? 'border-badge-sale' : 'border-border-light'" />
  
  @if (email?.invalid && email?.touched) {
    <p class="text-badge-sale text-xs mt-1">
      @if (email?.errors?.['required']) {
        Email is required
      }
      @if (email?.errors?.['email']) {
        Please enter a valid email
      }
    </p>
  }
</div>

<!-- Phone field -->
<div>
  <label for="phone" class="block text-sm font-medium text-text-dark mb-2">
    Phone
    <span class="text-badge-sale">*</span>
  </label>
  <input 
    id="phone"
    formControlName="phone"
    type="tel"
    placeholder="10+ digits"
    class="w-full border rounded-sm px-4 py-3"
    [ngClass]="phone?.invalid && phone?.touched ? 'border-badge-sale' : 'border-border-light'" />
  
  @if (phone?.invalid && phone?.touched) {
    <p class="text-badge-sale text-xs mt-1">
      @if (phone?.errors?.['required']) {
        Phone is required
      }
      @if (phone?.errors?.['invalidPhone']) {
        Phone must be at least 10 digits
      }
    </p>
  }
</div>

<!-- Submit button - disabled when form invalid -->
<button 
  (click)="placeOrder()"
  [disabled]="!checkoutForm.valid || items.length === 0"
  class="w-full bg-primary text-white py-3 font-semibold rounded-sm hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed">
  Place Order
</button>
```

---

## Priority 2: Accessibility Fixes

### Add ARIA Labels to ProductCard
**File:** `src/app/components/product-card/product-card.html`

```html
<!-- ❌ BEFORE -->
<div class="group relative cursor-pointer">
  <button (click)="toggleWishlist($event)">
    <svg class="w-4 h-4">...</svg>
    {{ isWishlisted ? 'Liked' : 'Like' }}
  </button>
</div>

<!-- ✅ AFTER -->
<div class="group relative cursor-pointer" [attr.data-testid]="'product-card-' + product.id">
  <button 
    (click)="toggleWishlist($event)"
    [attr.aria-label]="isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
    [attr.aria-pressed]="isWishlisted"
    class="flex items-center gap-1 transition-colors">
    <svg class="w-4 h-4" [attr.aria-hidden]="true" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
    </svg>
    <span>{{ isWishlisted ? 'Liked' : 'Like' }}</span>
  </button>
</div>
```

---

## Priority 3: Testing Configuration
**Update:** `angular.json`

```json
{
  "schematics": {
    "@schematics/angular:component": {
      "style": "css",
      "skipTests": false  // Change from true to false
    },
    "@schematics/angular:class": {
      "skipTests": false
    },
    "@schematics/angular:directive": {
      "skipTests": false
    },
    "@schematics/angular:pipe": {
      "skipTests": false
    }
  }
}
```

---

## Summary of Changes:

| Issue | Component | Fix | Impact |
|-------|-----------|-----|--------|
| Memory Leaks | Navbar, ProductCard | Use takeUntilDestroyed | +2 points |
| No Tests | All services | Add .spec.ts files | +15 points |
| No Validation | Checkout, Contact | Add Reactive Forms | +7 points |
| No A11y | ProductCard | Add aria-label | +3 points |
| Wrong Settings | angular.json | skipTests: false | Enables testing |

**Expected Score Improvement: 62.5 → 85+ (after implementing all fixes)**

---

## Required Installations:
```bash
# These are already in package.json, ensure versions are:
npm install
# Should install: @angular/forms (ReactiveFormsModule)
# Already have: @angular/core, rxjs, tailwindcss
```

---

## Testing Commands:
```bash
# Run tests
npm test

# Watch mode (run on file changes)
npm test -- --watch

# With coverage
npm test -- --code-coverage
```

---

## Next Steps:
1. ✅ Add memory leak fix (today)
2. ✅ Create service test files (today/tomorrow)
3. ✅ Migrate to Reactive Forms (tomorrow)
4. ✅ Add ARIA labels (Wednesday)
5. ✅ Achieve 80%+ test coverage (by Friday)

Good luck with the fixes! 🚀
