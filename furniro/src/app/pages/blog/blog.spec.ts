import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Blog } from './blog';
import { BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';

// ── Stubs ─────────────────────────────────────────────────────────────────────

@Component({ selector: 'app-breadcrumb', template: '', standalone: true })
class StubBreadcrumb { @Input() items: BreadcrumbItem[] = []; }

@Component({ selector: 'app-service-features', template: '', standalone: true })
class StubServiceFeatures {}

describe('Blog', () => {
  let fixture: ComponentFixture<Blog>;
  let component: Blog;

  beforeEach(async () => {
    spyOn(window, 'scrollTo');

    await TestBed.configureTestingModule({
      imports: [Blog, RouterTestingModule],
    })
      .overrideComponent(Blog, {
        set: { imports: [CommonModule, FormsModule, RouterTestingModule, StubBreadcrumb, StubServiceFeatures] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Blog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has correct breadcrumbs', () => {
    expect(component.breadcrumbs[0].label).toBe('Home');
    expect(component.breadcrumbs[1].label).toBe('Blog');
  });

  it('articles are loaded from JSON', () => {
    expect(Array.isArray(component.articles)).toBeTrue();
  });

  it('currentPage starts at 1', () => {
    expect(component.currentPage).toBe(1);
  });

  it('articlesPerPage is 3', () => {
    expect(component.articlesPerPage).toBe(3);
  });

  it('searchQuery starts empty', () => {
    expect(component.searchQuery).toBe('');
  });

  it('categories has 5 items', () => {
    expect(component.categories.length).toBe(5);
  });

  it('recentPosts has 3 items', () => {
    expect(component.recentPosts.length).toBe(3);
  });

  // ── filteredArticles ──────────────────────────────────────────────────────

  it('filteredArticles returns all articles when searchQuery is empty', () => {
    expect(component.filteredArticles.length).toBe(component.articles.length);
  });

  it('filteredArticles filters by title', () => {
    if (component.articles.length > 0) {
      const firstTitle = component.articles[0].title;
      component.searchQuery = firstTitle.slice(0, 4);
      expect(component.filteredArticles.length).toBeGreaterThan(0);
    }
  });

  it('filteredArticles returns empty when no match', () => {
    component.searchQuery = 'xyznonexistent999';
    expect(component.filteredArticles.length).toBe(0);
  });

  it('filteredArticles is case-insensitive', () => {
    if (component.articles.length > 0) {
      const firstTitle = component.articles[0].title;
      component.searchQuery = firstTitle.slice(0, 4).toUpperCase();
      expect(component.filteredArticles.length).toBeGreaterThan(0);
    }
  });

  // ── pagedArticles ─────────────────────────────────────────────────────────

  it('pagedArticles returns up to articlesPerPage items', () => {
    expect(component.pagedArticles.length).toBeLessThanOrEqual(component.articlesPerPage);
  });

  it('pagedArticles returns next page correctly', () => {
    if (component.totalPages > 1) {
      const page1 = component.pagedArticles.slice();
      component.setPage(2);
      expect(component.pagedArticles[0]).not.toEqual(page1[0]);
    }
  });

  // ── totalPages ────────────────────────────────────────────────────────────

  it('totalPages is calculated from filteredArticles', () => {
    const expected = Math.ceil(component.articles.length / component.articlesPerPage);
    expect(component.totalPages).toBe(expected);
  });

  // ── pageNumbers ───────────────────────────────────────────────────────────

  it('pageNumbers returns array 1..totalPages', () => {
    const expected = Array.from({ length: component.totalPages }, (_, i) => i + 1);
    expect(component.pageNumbers).toEqual(expected);
  });

  // ── setPage ───────────────────────────────────────────────────────────────

  it('setPage changes currentPage', () => {
    if (component.totalPages >= 2) {
      component.setPage(2);
      expect(component.currentPage).toBe(2);
    }
  });

  it('setPage ignores page < 1', () => {
    component.setPage(0);
    expect(component.currentPage).toBe(1);
  });

  it('setPage ignores page > totalPages', () => {
    component.setPage(9999);
    expect(component.currentPage).toBe(1);
  });

  it('setPage calls window.scrollTo', () => {
    component.setPage(1);
    expect(window.scrollTo).toHaveBeenCalled();
  });

  // ── filterByCategory ──────────────────────────────────────────────────────

  it('filterByCategory sets searchQuery to category name', () => {
    component.filterByCategory('Design');
    expect(component.searchQuery).toBe('Design');
  });

  it('filterByCategory resets currentPage to 1', () => {
    component.currentPage = 2;
    component.filterByCategory('Wood');
    expect(component.currentPage).toBe(1);
  });
});
