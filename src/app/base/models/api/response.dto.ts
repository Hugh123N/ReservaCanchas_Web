import { ResponseBaseDto } from './response-base.dto';

export class ResponseDto<T> extends ResponseBaseDto {
  constructor(data: T) {
    super();
    this.data = data;
  }
}
