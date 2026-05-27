import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Register } from './register';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

describe('Register', () => {
  let fixture: ComponentFixture<Register>;
  let component: Register;
  let authSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['register']);
    authSpy.register.and.returnValue(of({
      success: true,
      message: 'Registration successful',
      data: null,
    }));

    await TestBed.configureTestingModule({
      imports: [Register, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    })
      .overrideComponent(Register, {
        set: { imports: [CommonModule, ReactiveFormsModule, RouterTestingModule] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Form initialization ───────────────────────────────────────────────────

  it('initialises with empty name, email, password', () => {
    expect(component.name.value).toBe('');
    expect(component.email.value).toBe('');
    expect(component.password.value).toBe('');
  });

  it('form is invalid when empty', () => {
    expect(component.registerForm.invalid).toBeTrue();
  });

  it('name is invalid when fewer than 2 characters', () => {
    component.name.setValue('A');
    expect(component.name.invalid).toBeTrue();
  });

  it('name is valid when 2 or more characters', () => {
    component.name.setValue('Al');
    expect(component.name.valid).toBeTrue();
  });

  it('email is invalid for wrong format', () => {
    component.email.setValue('bademail');
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
    component.password.setValue('secure123');
    expect(component.password.valid).toBeTrue();
  });

  it('form is valid when all fields are correct', () => {
    component.name.setValue('John Doe');
    component.email.setValue('john@example.com');
    component.password.setValue('password123');
    expect(component.registerForm.valid).toBeTrue();
  });

  // ── togglePassword ────────────────────────────────────────────────────────

  it('showPassword defaults to false', () => {
    expect(component.showPassword).toBeFalse();
  });

  it('togglePassword flips showPassword', () => {
    component.togglePassword();
    expect(component.showPassword).toBeTrue();
  });

  // ── onSubmit — invalid form ───────────────────────────────────────────────

  it('onSubmit with invalid form does not call authService.register', () => {
    component.onSubmit();
    expect(authSpy.register).not.toHaveBeenCalled();
  });

  it('onSubmit with invalid form marks all controls as touched', () => {
    component.onSubmit();
    expect(component.name.touched).toBeTrue();
    expect(component.email.touched).toBeTrue();
    expect(component.password.touched).toBeTrue();
  });

  // ── onSubmit — success ────────────────────────────────────────────────────

  it('onSubmit with valid form calls authService.register', () => {
    component.name.setValue('John Doe');
    component.email.setValue('john@example.com');
    component.password.setValue('password123');
    component.onSubmit();
    expect(authSpy.register).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123');
  });

  it('onSubmit success sets successMessage', fakeAsync(() => {
    component.name.setValue('John');
    component.email.setValue('john@example.com');
    component.password.setValue('password123');
    component.onSubmit();
    tick();
    expect(component.successMessage).toContain('Registration successful');
  }));

  it('onSubmit success navigates to login after 1800ms', fakeAsync(() => {
    component.name.setValue('John');
    component.email.setValue('john@example.com');
    component.password.setValue('password123');
    component.onSubmit();
    tick(1800);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('onSubmit success sets loading to false', fakeAsync(() => {
    component.name.setValue('John');
    component.email.setValue('john@example.com');
    component.password.setValue('password123');
    component.onSubmit();
    tick();
    expect(component.loading).toBeFalse();
  }));

  // ── onSubmit — error ──────────────────────────────────────────────────────

  it('onSubmit error sets errorMessage from server', fakeAsync(() => {
    authSpy.register.and.returnValue(throwError(() => ({ error: { message: 'Email already exists' } })));
    component.name.setValue('John');
    component.email.setValue('john@example.com');
    component.password.setValue('password123');
    component.onSubmit();
    tick();
    expect(component.errorMessage).toBe('Email already exists');
  }));

  it('onSubmit error sets fallback errorMessage when no server message', fakeAsync(() => {
    authSpy.register.and.returnValue(throwError(() => ({})));
    component.name.setValue('John');
    component.email.setValue('john@example.com');
    component.password.setValue('password123');
    component.onSubmit();
    tick();
    expect(component.errorMessage).toBeTruthy();
  }));

  it('onSubmit error sets loading to false', fakeAsync(() => {
    authSpy.register.and.returnValue(throwError(() => ({ error: { message: 'fail' } })));
    component.name.setValue('John');
    component.email.setValue('john@example.com');
    component.password.setValue('password123');
    component.onSubmit();
    tick();
    expect(component.loading).toBeFalse();
  }));

  it('errorMessage is empty initially', () => {
    expect(component.errorMessage).toBe('');
  });

  it('successMessage is empty initially', () => {
    expect(component.successMessage).toBe('');
  });
});
