export class PageParamsModel {
    page: number = 0;
    pageSize: number = 0;

    constructor(page: number, pageSize: number) {
        this.page = page;
        this.pageSize = pageSize;
    }
}
