import { Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page401',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './page401.component.html'
})
export class Page401Component {

  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
