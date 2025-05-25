export class QueryResultsModel<T> {
  items: T[] = [];
  total: number = 0;
  page: number = 0;
  pageSize: number = 0;
  errorMessage: string = '';

  constructor(items: any[] = [], total: number = 0, errorMessage: string = '') {
    this.items = items;
    this.total = total;
    this.errorMessage = errorMessage;
  }
}
