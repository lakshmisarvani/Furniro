import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Breadcrumb, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { ServiceFeatures } from '../../components/service-features/service-features';
import { Product, BlogArticle, Category, RecentPost } from '../../components/models/models';
import blogData from '../../data/blogs.json';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, RouterLink, FormsModule, Breadcrumb, ServiceFeatures],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Blog' },
  ];

  searchQuery = '';
  currentPage = 1;
  articlesPerPage = 3;

  articles: BlogArticle[] = blogData;

  categories: Category[] = [
    { name: 'Crafts', count: 2 },
    { name: 'Design', count: 8 },
    { name: 'Handmade', count: 7 },
    { name: 'Interior', count: 1 },
    { name: 'Wood', count: 6 },
  ];

  recentPosts: RecentPost[] = [
    {
      title: 'Go to the future with a new chair model',
      date: '03 Aug 2023',
      image: 'https://picsum.photos/seed/recent1/120/120',
    },
    {
      title: 'Colorful 2024 Bedroom & Dining Room ideas',
      date: '18 Jun 2023',
      image: 'https://picsum.photos/seed/recent2/120/120',
    },
    {
      title: 'Our Furniture Was Picked Up By BOLO Magazine',
      date: '21 Jul 2023',
      image: 'https://picsum.photos/seed/recent3/120/120',
    },
  ];

  get filteredArticles(): BlogArticle[] {
    if (!this.searchQuery.trim()) return this.articles;
    const q = this.searchQuery.toLowerCase();
    return this.articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredArticles.length / this.articlesPerPage);
  }

  get pagedArticles(): BlogArticle[] {
    const start = (this.currentPage - 1) * this.articlesPerPage;
    return this.filteredArticles.slice(start, start + this.articlesPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  filterByCategory(cat: string) {
    this.searchQuery = cat;
    this.currentPage = 1;
  }
}
