import { ApplicationMessage } from './application-message.dto';

export class ResponseBaseDto<T = any> {
  isValid: boolean = false;
  messages: ApplicationMessage[] = [];
  data!: T;

  static getMessages(response: ResponseBaseDto<any>): string {
    var messages = '';

    if (response.messages) {
      response.messages.forEach((item) => messages = messages + item.message + '\n')
    }

    return messages;
  };
}
