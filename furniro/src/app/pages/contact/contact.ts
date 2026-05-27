import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Breadcrumb, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { ServiceFeatures } from '../../components/service-features/service-features';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, Breadcrumb, ServiceFeatures],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Contact' },
  ];

  form = { name: '', email: '', subject: '', message: '' };
  submitted = false;

  submit() {
    if (this.form.name && this.form.email && this.form.message) {
      this.submitted = true;
      setTimeout(() => {
        this.submitted = false;
        this.form = { name: '', email: '', subject: '', message: '' };
      }, 3000);
    }
  }
}
