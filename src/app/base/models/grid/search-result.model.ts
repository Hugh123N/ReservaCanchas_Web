export class SearchResultModel<TModel> {
    total: number = 0;
    page: number = 0;
    pageSize: number = 0;
    items: TModel[] = [];
}
