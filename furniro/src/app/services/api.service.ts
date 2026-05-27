import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

const BASE_URL = 'http://localhost:5000';

export interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  discount: number;
}

export interface ProductsResponse {
  products: BackendProduct[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

export interface BackendCartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

export interface BackendCart {
  user: string;
  items: BackendCartItem[];
}

export interface BackendWishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
}

export interface BackendWishlist {
  user: string;
  items: BackendWishlistItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'name' | 'newest' | 'default';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // ─── Products ──────────────────────────────────────────────

  getProducts(params: ProductFilterParams = {}): Observable<ApiResponse<ProductsResponse>> {
    let httpParams = new HttpParams();
    if (params.page)     httpParams = httpParams.set('page', params.page);
    if (params.limit)    httpParams = httpParams.set('limit', params.limit);
    if (params.search)   httpParams = httpParams.set('search', params.search);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.minPrice) httpParams = httpParams.set('minPrice', params.minPrice);
    if (params.maxPrice) httpParams = httpParams.set('maxPrice', params.maxPrice);
    if (params.sort && params.sort !== 'default') {
      httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.get<ApiResponse<ProductsResponse>>(`${BASE_URL}/products`, { params: httpParams });
  }

  getProductById(id: string): Observable<ApiResponse<{ product: BackendProduct }>> {
    return this.http.get<ApiResponse<{ product: BackendProduct }>>(`${BASE_URL}/products/${id}`);
  }

  compareProducts(ids: string[]): Observable<ApiResponse<{ products: BackendProduct[] }>> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.get<ApiResponse<{ products: BackendProduct[] }>>(`${BASE_URL}/products/compare`, { params });
  }

  // ─── Cart ──────────────────────────────────────────────────

  getCart(): Observable<ApiResponse<{ cart: BackendCart }>> {
    return this.http.get<ApiResponse<{ cart: BackendCart }>>(
      `${BASE_URL}/cart`,
      { headers: this.auth.authHeaders() }
    );
  }

  addToCart(item: BackendCartItem): Observable<ApiResponse<{ cart: BackendCart }>> {
    return this.http.post<ApiResponse<{ cart: BackendCart }>>(
      `${BASE_URL}/cart`,
      item,
      { headers: this.auth.authHeaders() }
    );
  }

  updateCartItem(productId: string, quantity: number): Observable<ApiResponse<{ cart: BackendCart }>> {
    return this.http.put<ApiResponse<{ cart: BackendCart }>>(
      `${BASE_URL}/cart/${productId}`,
      { quantity },
      { headers: this.auth.authHeaders() }
    );
  }

  removeFromCart(productId: string): Observable<ApiResponse<{ cart: BackendCart }>> {
    return this.http.delete<ApiResponse<{ cart: BackendCart }>>(
      `${BASE_URL}/cart/${productId}`,
      { headers: this.auth.authHeaders() }
    );
  }

  clearCart(): Observable<ApiResponse<{ cart: BackendCart }>> {
    return this.http.delete<ApiResponse<{ cart: BackendCart }>>(
      `${BASE_URL}/cart`,
      { headers: this.auth.authHeaders() }
    );
  }

  syncCart(items: BackendCartItem[]): Observable<ApiResponse<{ cart: BackendCart }>> {
    return this.http.post<ApiResponse<{ cart: BackendCart }>>(
      `${BASE_URL}/cart/sync`,
      { items },
      { headers: this.auth.authHeaders() }
    );
  }

  // ─── Wishlist ──────────────────────────────────────────────

  getWishlist(): Observable<ApiResponse<{ wishlist: BackendWishlist }>> {
    return this.http.get<ApiResponse<{ wishlist: BackendWishlist }>>(
      `${BASE_URL}/wishlist`,
      { headers: this.auth.authHeaders() }
    );
  }

  toggleWishlist(item: BackendWishlistItem): Observable<ApiResponse<{ wishlist: BackendWishlist; action: string }>> {
    return this.http.post<ApiResponse<{ wishlist: BackendWishlist; action: string }>>(
      `${BASE_URL}/wishlist/toggle`,
      item,
      { headers: this.auth.authHeaders() }
    );
  }

  syncWishlist(items: BackendWishlistItem[]): Observable<ApiResponse<{ wishlist: BackendWishlist }>> {
    return this.http.post<ApiResponse<{ wishlist: BackendWishlist }>>(
      `${BASE_URL}/wishlist/sync`,
      { items },
      { headers: this.auth.authHeaders() }
    );
  }

  // ─── Orders ───────────────────────────────────────────────

  placeOrder(payload: {
    shippingAddress: { street: string; city: string; zip: string; country: string };
    paymentMethod?: string;
    items: { productId: string; name: string; price: number; quantity: number }[];
    totalAmount: number;
  }): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${BASE_URL}/orders`,
      payload,
      { headers: this.auth.authHeaders() }
    );
  }

  getOrders(): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(
      `${BASE_URL}/orders`,
      { headers: this.auth.authHeaders() }
    );
  }

  getOrderById(id: string): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(
      `${BASE_URL}/orders/${id}`,
      { headers: this.auth.authHeaders() }
    );
  }
}
