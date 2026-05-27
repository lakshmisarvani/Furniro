import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let authSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['login']);
    authSpy.login.and.returnValue(of({
      success: true,
      message: 'ok',
      data: { token: 'tok', user: { id: '1', name: 'Test', email: 'test@test.com' } },
    }));

    await TestBed.configureTestingModule({
      imports: [Login, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    })
      .overrideComponent(Login, {
        set: { imports: [CommonModule, ReactiveFormsModule, RouterTestingModule] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Form initialization ───────────────────────────────────────────────────

  it('initialises with empty email and password', () => {
    expect(component.email.value).toBe('');
    expect(component.password.value).toBe('');
  });

  it('loginForm is invalid when empty', () => {
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('email is invalid when empty', () => {
    expect(component.email.invalid).toBeTrue();
  });

  it('email is invalid for non-email format', () => {
    component.email.setValue('notanemail');
    expect(component.email.invalid).toBeTrue();
  });

  it('email is valid for correct format', () => {
    component.email.setValue('user@example.com');
    expect(component.email.valid).toBeTrue();
  });

  it('password is invalid when fewer than 6 characters', () => {
    component.password.setValue('abc');
    expect(component.password.invalid).toBeTrue();
  });

  it('password is valid when 6 or more characters', () => {
    component.password.setValue('secret123');
    expect(component.password.valid).toBeTrue();
  });

  it('form is valid when email and password are correct', () => {
    component.email.setValue('user@example.com');
    component.password.setValue('password123');
    expect(component.loginForm.valid).toBeTrue();
  });

  // ── togglePassword ────────────────────────────────────────────────────────

  it('showPassword defaults to false', () => {
    expect(component.showPassword).toBeFalse();
  });

  it('togglePassword flips showPassword to true', () => {
    component.togglePassword();
    expect(component.showPassword).toBeTrue();
  });

  it('togglePassword flips showPassword back to false', () => {
    component.togglePassword();
    component.togglePassword();
    expect(component.showPassword).toBeFalse();
  });

  // ── onSubmit — invalid form ───────────────────────────────────────────────

  it('onSubmit with invalid form does not call authService.login', () => {
    component.onSubmit();
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  it('onSubmit with invalid form marks all controls as touched', () => {
    component.onSubmit();
    expect(component.email.touched).toBeTrue();
    expect(component.password.touched).toBeTrue();
  });

  // ── onSubmit — success ────────────────────────────────────────────────────

  it('onSubmit with valid form calls authService.login', () => {
    component.email.setValue('user@example.com');
    component.password.setValue('password123');
    component.onSubmit();
    expect(authSpy.login).toHaveBeenCalledWith('user@example.com', 'password123');
  });

  it('onSubmit success sets loading to false', fakeAsync(() => {
    component.email.setValue('user@example.com');
    component.password.setValue('password123');
    component.onSubmit();
    tick();
    expect(component.loading).toBeFalse();
  }));

  it('onSubmit success navigates to home', fakeAsync(() => {
    component.email.setValue('user@example.com');
    component.password.setValue('password123');
    component.onSubmit();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  // ── onSubmit — error ──────────────────────────────────────────────────────

  it('onSubmit error sets errorMessage from server', fakeAsync(() => {
    authSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));
    component.email.setValue('user@example.com');
    component.password.setValue('wrongpass');
    component.onSubmit();
    tick();
    expect(component.errorMessage).toBe('Invalid credentials');
  }));

  it('onSubmit error sets fallback errorMessage when no server message', fakeAsync(() => {
    authSpy.login.and.returnValue(throwError(() => ({})));
    component.email.setValue('user@example.com');
    component.password.setValue('wrongpass');
    component.onSubmit();
    tick();
    expect(component.errorMessage).toBeTruthy();
  }));

  it('onSubmit error sets loading to false', fakeAsync(() => {
    authSpy.login.and.returnValue(throwError(() => ({ error: { message: 'fail' } })));
    component.email.setValue('user@example.com');
    component.password.setValue('wrongpass');
    component.onSubmit();
    tick();
    expect(component.loading).toBeFalse();
  }));

  it('loading is set to true during submission', () => {
    authSpy.login.and.returnValue(of({
      success: true, message: 'ok',
      data: { token: 't', user: { id: '1', name: 'T', email: 't@t.com' } },
    }));
    component.email.setValue('user@example.com');
    component.password.setValue('password123');
    let loadingDuringCall = false;
    authSpy.login.and.callFake(() => {
      loadingDuringCall = component.loading;
      return of({ success: true, message: 'ok', data: { token: 't', user: { id: '1', name: 'T', email: 't@t.com' } } });
    });
    component.onSubmit();
    expect(loadingDuringCall).toBeTrue();
  });
});
