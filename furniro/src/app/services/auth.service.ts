import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const API_URL = 'http://localhost:5000';
const TOKEN_KEY = 'furniro_token';
const USER_KEY = 'furniro_user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  register(name: string, email: string, password: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, {
      email,
      password,
    }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.saveToken(res.data.token);
          this.saveUser(res.data.user);
        }
      })
    );
  }

  getProfile(): Observable<ApiResponse<{ user: AuthUser }>> {
    return this.http.get<ApiResponse<{ user: AuthUser }>>(`${API_URL}/auth/profile`, {
      headers: this.authHeaders(),
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private saveUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken() ?? ''}`,
    });
  }
}
