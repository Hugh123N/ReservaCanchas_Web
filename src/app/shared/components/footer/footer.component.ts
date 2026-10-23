import { Component, Inject, ViewContainerRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BaseComponent } from '@base/components/base-component/base.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent extends BaseComponent {

  constructor(
    private router: Router,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('FOOTER', viewContainerRef);
  }

  get anio(): number {
    return new Date().getFullYear();
  }

  onComoFunciona(event: Event): void {
    event.preventDefault();

    if (typeof window === 'undefined') return;

    if (this.router.url.split('#')[0] === '/') {
      this.scrollToComo();
      return;
    }

    this.router.navigate(['/'], { fragment: 'como' }).then(() => {
      setTimeout(() => this.scrollToComo());
    });
  }

  onVolverArriba(): void {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: this.scrollBehavior() });
  }

  private scrollToComo(): void {
    const element = document.getElementById('como');
    if (!element) return;
    const offset = element.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: this.scrollBehavior() });
  }

  private scrollBehavior(): ScrollBehavior {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }
}
