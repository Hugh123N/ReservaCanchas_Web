import { Component, Inject, ViewContainerRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BaseComponent } from '@base/components/base-component/base.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatDividerModule, MatIconModule, MatButtonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent extends BaseComponent {

  constructor(
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('FOOTER', viewContainerRef);
  }

}
