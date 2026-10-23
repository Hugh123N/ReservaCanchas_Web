import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BaseComponent } from '@base/components/base-component/base.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { SeoService } from '../../../seo/core/services/seo.service';

@Component({
  selector: 'app-dueno-landing',
  standalone: true,
  imports: [RouterModule, MatIconModule, NavVarComponent, FooterComponent],
  templateUrl: './dueno-landing.component.html',
  styleUrl: './dueno-landing.component.css'
})
export class DuenoLandingComponent extends BaseComponent implements OnInit {

  readonly duenoTabs = [
    { id: 'h1', titulo: 'Menú del negocio', descripcion: 'Canchas, operadores, reservas, calendario y configuración, todo en un solo lugar.' },
    { id: 'h2', titulo: 'Resumen del mes', descripcion: 'Ingresos, reservas del mes y de hoy, y qué tan ocupadas están tus canchas.' },
    { id: 'h3', titulo: 'Ingresos por mes', descripcion: 'Mira cómo crece tu negocio en los últimos 6 meses.' },
    { id: 'h4', titulo: 'Canchas más populares', descripcion: 'Descubre cuáles se reservan más y cuánto generan.' },
  ];
  selectedDuenoTab: string = 'h1';

  constructor(
    private router: Router,
    private seoService: SeoService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('DUENO', viewContainerRef);
  }

  get selectedDuenoTabData() {
    return this.duenoTabs.find((tab) => tab.id === this.selectedDuenoTab) ?? this.duenoTabs[0];
  }

  ngOnInit(): void {
    this.seoService.setPublicaTuCancha();
  }

  selectDuenoTab(id: string): void {
    this.selectedDuenoTab = id;
  }

  onRegistrarCancha(): void {
    this.router.navigate(['/planes']);
  }
}
