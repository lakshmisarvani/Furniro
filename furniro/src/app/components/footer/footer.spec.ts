import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer } from './footer';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render footer title', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Funiro.');
  });

  it('should render navigation links', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));

    expect(links.length).toBeGreaterThan(0);

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Home');
    expect(text).toContain('Shop');
    expect(text).toContain('About');
    expect(text).toContain('Contact');
  });

  it('should render newsletter input', () => {
    const input = fixture.debugElement.query(
      By.css('input[type="email"]')
    );

    expect(input).toBeTruthy();
  });

  it('should update email model when typing', () => {
    const input = fixture.debugElement.query(
      By.css('input[type="email"]')
    ).nativeElement;

    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    expect(component.email).toBe('test@example.com');
  });

  it('should show required message when email is empty', () => {
    component.email = '';

    component.subscribe();

    fixture.detectChanges();

    expect(component.message).toBe('Email is required');

    expect(fixture.nativeElement.textContent)
      .toContain('Email is required');
  });

  it('should show invalid email message', () => {
    component.email = 'invalidemail';

    component.subscribe();

    fixture.detectChanges();

    expect(component.message).toBe('Enter valid email');

    expect(fixture.nativeElement.textContent)
      .toContain('Enter valid email');
  });

  it('should show success message for valid email', () => {
    component.email = 'test@example.com';

    component.subscribe();

    fixture.detectChanges();

    expect(component.message)
      .toBe('Subscribed Successfully!');

    expect(component.email).toBe('');

    expect(fixture.nativeElement.textContent)
      .toContain('Subscribed Successfully!');
  });

  it('should call subscribe() when button is clicked', () => {
    spyOn(component, 'subscribe');

    const button = fixture.debugElement.query(
      By.css('button')
    );

    button.triggerEventHandler('click');

    expect(component.subscribe).toHaveBeenCalled();
  });

  it('should clear email after successful subscription', () => {
    component.email = 'user@gmail.com';

    component.subscribe();

    expect(component.email).toBe('');
  });

  it('should not clear email for invalid subscription', () => {
    component.email = 'invalid-email';

    component.subscribe();

    expect(component.email).toBe('invalid-email');
  });

  it('should render copyright text', () => {
    expect(fixture.nativeElement.textContent)
      .toContain('2023 Funiro. All rights reserved');
  });
});