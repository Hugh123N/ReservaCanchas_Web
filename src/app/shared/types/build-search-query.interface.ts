import { LoteSearchParams } from "../models/params/lote-search-params.model";
import { SortConfig } from "./sort.interface";
import { QueryParamsModel } from "@base/models/query/query-params.model";
import { PageParamsModel } from "@base/models/query/page-params.model";
import { SortParamsModel } from "@base/models/query/sort-params.model";

export function buildSearchQuery(
    filter: LoteSearchParams,
    page: number = 1,
    size: number = 10,
    sort?: SortConfig
): QueryParamsModel {
    const pageParams = new PageParamsModel(page, size);
    const sortParams: SortParamsModel[] = sort
        ? [new SortParamsModel(sort.field, sort.direction)]
        : [new SortParamsModel('fechaCreacion', 'desc')];

    return new QueryParamsModel(filter, pageParams, sortParams);
}