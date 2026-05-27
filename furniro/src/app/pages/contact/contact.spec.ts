import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { Contact } from './contact';
import { BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';

// ── Stubs ─────────────────────────────────────────────────────────────────────

@Component({ selector: 'app-breadcrumb', template: '', standalone: true })
class StubBreadcrumb { @Input() items: BreadcrumbItem[] = []; }

@Component({ selector: 'app-service-features', template: '', standalone: true })
class StubServiceFeatures {}

describe('Contact', () => {
  let fixture: ComponentFixture<Contact>;
  let component: Contact;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
    })
      .overrideComponent(Contact, {
        set: { imports: [CommonModule, FormsModule, StubBreadcrumb, StubServiceFeatures] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has correct breadcrumbs', () => {
    expect(component.breadcrumbs[0].label).toBe('Home');
    expect(component.breadcrumbs[1].label).toBe('Contact');
  });

  // ── Initial form state ────────────────────────────────────────────────────

  it('form starts with empty fields', () => {
    expect(component.form.name).toBe('');
    expect(component.form.email).toBe('');
    expect(component.form.subject).toBe('');
    expect(component.form.message).toBe('');
  });

  it('submitted is false initially', () => {
    expect(component.submitted).toBeFalse();
  });

  // ── submit — validation ───────────────────────────────────────────────────

  it('submit does nothing when name is missing', () => {
    component.form = { name: '', email: 'a@b.com', subject: '', message: 'Hello' };
    component.submit();
    expect(component.submitted).toBeFalse();
  });

  it('submit does nothing when email is missing', () => {
    component.form = { name: 'John', email: '', subject: '', message: 'Hello' };
    component.submit();
    expect(component.submitted).toBeFalse();
  });

  it('submit does nothing when message is missing', () => {
    component.form = { name: 'John', email: 'a@b.com', subject: '', message: '' };
    component.submit();
    expect(component.submitted).toBeFalse();
  });

  // ── submit — success ──────────────────────────────────────────────────────

  it('submit sets submitted to true with valid form', () => {
    component.form = { name: 'John', email: 'john@test.com', subject: 'Test', message: 'Hello there' };
    component.submit();
    expect(component.submitted).toBeTrue();
  });

  it('submit resets submitted to false after 3 seconds', fakeAsync(() => {
    component.form = { name: 'John', email: 'john@test.com', subject: 'Test', message: 'Hello there' };
    component.submit();
    expect(component.submitted).toBeTrue();
    tick(3000);
    expect(component.submitted).toBeFalse();
  }));

  it('submit clears form fields after 3 seconds', fakeAsync(() => {
    component.form = { name: 'John', email: 'john@test.com', subject: 'Test', message: 'Hello there' };
    component.submit();
    tick(3000);
    expect(component.form.name).toBe('');
    expect(component.form.email).toBe('');
    expect(component.form.message).toBe('');
  }));

  it('subject field is optional for valid submission', () => {
    component.form = { name: 'John', email: 'john@test.com', subject: '', message: 'Hello' };
    component.submit();
    expect(component.submitted).toBeTrue();
  });
});
