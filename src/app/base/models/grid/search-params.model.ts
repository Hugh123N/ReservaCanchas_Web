import { SearchParamsBaseModel } from './search-params-base.model'

export class SearchParamsModel extends SearchParamsBaseModel {
    filter: any;

    constructor(filter: any, page: number = 0, pageSize: number = 0) {
        super(page, pageSize)
        this.filter = filter;
    }
}
