import { Inject, ViewContainerRef } from '@angular/core';
import { BaseComponent } from '@base/components/base-component/base.component';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { PageParamsModel } from '@base/models/query/page-params.model';
import { SortParamsModel } from '@base/models/query/sort-params.model';

@Inject('BaseComponent')
export abstract class BaseSearchComponent extends BaseComponent {
  public filter: any = null;
  public total: number = 0;
  public page: PageParamsModel;
  public sort: SortParamsModel[];

  constructor(module: string, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(module, viewContainerRef);

    this.page = new PageParamsModel(1, 10);
    this.sort = [];
  }
  updateSort(sort: any) {
    this.sort = sort;
  }
  updateFilter(filter: any) {
    this.filter = filter;
  }

  updatePage(page: number) {
    this.page.page = page;
  }

  getPageParams(): QueryParamsModel {
    let params = new QueryParamsModel(this.filter, this.page, this.sort);
    return params;
  }
}
