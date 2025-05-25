import { PageParamsModel } from './page-params.model'
import { SortParamsModel } from './sort-params.model'

export class SearchParamsBaseModel {
    page?: PageParamsModel;
    sort: SortParamsModel[] = [];

    constructor(page: number = 0, pageSize: number = 0) {
        if (page)
            this.page = new PageParamsModel(page, pageSize);
    }
}
