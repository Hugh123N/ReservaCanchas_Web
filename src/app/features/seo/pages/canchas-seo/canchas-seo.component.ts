import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CardCanchaComponent } from '../../../canchas/components/card-cancha/card-cancha.component';
import { SlugResolverService } from '../../core/services/slug-resolver.service';
import { SeoService } from '../../core/services/seo.service';
import { SeoResolution } from '../../core/models/seo-config.model';
import { CanchaService } from '../../../canchas/core/services/cancha.service';
import { SearchCancha } from '../../../canchas/core/model/searchCancha.model';
import { BaseSearchComponent } from '@base/components/base-search-component/search-base.component';
import { canchasParams } from 'app/features/canchas/helper/canchas-params';
import { PageParamsModel } from '@base/models/query/page-params.model';

@Component({
  selector: 'app-canchas-seo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CardCanchaComponent
  ],
  templateUrl: './canchas-seo.component.html',
  styleUrl: './canchas-seo.component.css'
})
export class CanchasSeoComponent extends BaseSearchComponent implements OnInit {

  resolution: SeoResolution | null = null;
  canchas: SearchCancha[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private slugResolver: SlugResolverService,
    private seoService: SeoService,
    private canchaService: CanchaService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('CANCHAS', viewContainerRef);
  }

  async ngOnInit(): Promise<void> {
    await this.slugResolver.initialize();

    const p1 = this.route.snapshot.params['parametro1'];
    const p2 = this.route.snapshot.params['parametro2'];

    this.resolution = this.slugResolver.resolver(p1, p2);

    if (!this.resolution.esValido) {
      this.router.navigate(['/404']);
      return;
    }

    const currentUrl = this.router.url;
    if (currentUrl !== this.resolution.urlCanonical) {
      this.router.navigate([this.resolution.urlCanonical]);
      return;
    }

    this.seoService.setCanchasSEO(
      this.resolution.ciudad?.provincia || null,
      this.resolution.deporte?.nombre || null
    );

    this.loadCanchas();
  }

  private loadCanchas(): void {
    this.isLoading = true;

    const filter: any = {};

    if (this.resolution?.ciudad) {
      filter.codigoUbigeo = this.resolution.ciudad.codigoUbigeo;
    }
    if (this.resolution?.deporte) {
      filter.idTipoDeporte = this.resolution.deporte.idTipoDeporte;
    }


    const sort = {
      property: "CreateDate",
      direction: "desc",
    };
    const pageSize = 20;
    const filterToUse = filter || canchasParams(filter);
    const pageParams = new PageParamsModel(1, pageSize);

    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);

    const params = this.getPageParams();
    this.canchaService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.canchas = response.data.items;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSelectCancha(cancha: SearchCancha): void {
    this.router.navigate(['/cancha', cancha.idCancha]);
  }
}
