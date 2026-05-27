import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink,FormsModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {
  email = '';
message = '';

subscribe() {
  if (!this.email) {
    this.message = 'Email is required';
    return;
  }

  if (!this.email.includes('@')) {
    this.message = 'Enter valid email';
    return;
  }

  this.message = 'Subscribed Successfully!';
  this.email = '';
}
}
