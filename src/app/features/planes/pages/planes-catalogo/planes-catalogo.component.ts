import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '@base/components/base-component/base.component';
import { PlanService } from '../../core/services/plan.service';
import { ListPlaneDto } from '../../core/models/plan.model';
import { GetPlanTarifaDto } from '../../core/models/plan-tarifa.model';
import { SeoService } from 'app/features/seo/core/services/seo.service';

@Component({
  selector: 'app-planes-catalogo',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './planes-catalogo.component.html',
  styleUrl: './planes-catalogo.component.css'
})
export class PlanesCatalogoComponent extends BaseComponent implements OnInit {

  planes: ListPlaneDto[] = [];
  isLoading = false;

  private readonly ONBOARDING_BASE_URL = 'https://gestion.reservafast.com/onboarding';

  constructor(
    private planService: PlanService,
    private seoService: SeoService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('PLANES', viewContainerRef);
  }

  ngOnInit(): void {
    this.seoService.setPlanes();
    this.loadPlanes();
  }

  private loadPlanes(): void {
    this.isLoading = true;
    this.planService.getPlanes().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.planes = response.data;
        } else {
          this.openErrorAlert('No se pudieron cargar los planes');
        }
        this.isLoading = false;
      },
      error: () => {
        this.openErrorAlert('Error al cargar los planes');
        this.isLoading = false;
      }
    });
  }

  getTarifaForPlan(plan: ListPlaneDto): GetPlanTarifaDto | undefined {
    if (!plan.planTarifa || plan.planTarifa.length === 0) return undefined;
    if (plan.planTarifa.length === 1) return plan.planTarifa[0];
    return plan.planTarifa.find(t => t.codigo === 'MONTHLY') ?? plan.planTarifa[0];
  }

  getLimite(plan: ListPlaneDto, codigo: string): number {
    return plan.planLimite?.find(l => l.codigo === codigo)?.valor ?? 0;
  }

  onSeleccionarPlan(plan: ListPlaneDto): void {
    window.open(`${this.ONBOARDING_BASE_URL}/${plan.idPlane}`, '_blank');
  }
}
