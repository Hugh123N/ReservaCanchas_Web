import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page404',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './page404.component.html'
})
export class Page404Component {
  constructor(
    private router: Router,
    private location: Location
  ) { }

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
