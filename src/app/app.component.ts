import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AsyncPipe } from '@angular/common';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'court-reservation-public';

  constructor(public loadingService: LoadingService) {}
}
