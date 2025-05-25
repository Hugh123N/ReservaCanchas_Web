import { Inject, OnDestroy, ViewContainerRef } from '@angular/core';
// rxjs
import { Subscription } from 'rxjs';
import * as objectPath from 'object-path';
import { ResponseBaseDto } from '../../models/api/response-base.dto';
import { PERMISSIONS } from '@core/config/permissions/permissions';
import Swal from 'sweetalert2';

const DEFAULT_DELAY: number = 5000;

@Inject('BaseComponent')
export abstract class BaseComponent implements OnDestroy {
  public PERMISSIONS: any;
  protected viewContainerRef: ViewContainerRef;
  protected subscriptions: Subscription[] = [];

  constructor(
    module: string,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    this.viewContainerRef = viewContainerRef;
    this.PERMISSIONS = objectPath.get(PERMISSIONS, module) ?? {};
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      try {
        this.subscriptions.forEach((el) => el.unsubscribe());
      } catch (err) {
        console.error(err);
      }
    }
  }

  openSuccessAlert(result: any): void {
    let message =
      typeof result === 'string' || result instanceof String
        ? result
        : ResponseBaseDto.getMessages(result);

    if (message) this.openSweetAlert('¡Success!', message as string, 'success');
  }

  openInfoAlert(result: any): void {
    const message =
      typeof result === 'string' || result instanceof String
        ? result
        : ResponseBaseDto.getMessages(result);

    if (message) this.openSweetAlert('¡Info!', message as string, 'info');
  }

  openWarningAlert(result: any): void {
    const message =
      typeof result === 'string' || result instanceof String
        ? result
        : ResponseBaseDto.getMessages(result);

    if (message) this.openSweetAlert('¡Warning!', message as string, 'warning');
  }

  openErrorAlert(result: any): void {
    const message =
      typeof result === 'string' || result instanceof String
        ? result
        : ResponseBaseDto.getMessages(result);

    if (message) this.openSweetAlert('¡Error!', message as string, 'error');
  }

  openAlert(response: any, timeOut = 2000): void {
    if (response == null) return;
    if (response.Messages == null && response.messages == null) return;
    var messages = response.Messages ?? response.messages;

    messages.forEach((message: any, index: number) => {
      let title = '¡Info!';
      let icon: 'success' | 'info' | 'warning' | 'error' = 'info';

      var MessageType = message.MessageType ?? message.messageType;
      switch (MessageType) {
        case 0: // Success
          title = '¡Success!';
          icon = 'success';
          break;
        case 1: // Info
          title = '¡Info!';
          icon = 'info';
          break;
        case 2: // Warning
          title = '¡Warning!';
          icon = 'warning';
          break;
        case 3: //¡Error
          title = '¡Error!';
          icon = 'error';
          break;
      }
      var Message = message.Message ?? message.message;
      if (Message) {
        setTimeout(() => {
          this.openSweetAlert(title, Message as string, icon);
        }, index * (timeOut + 500));
      }
    });
  }

  openSweetAlert(
    title: string,
    text: string,
    type: 'success' | 'info' | 'warning' | 'error'
  ): void {
    Swal({
      title,
      text,
      position: 'center',
      type,
      showConfirmButton: true,
      timer: 2500,
    });
  }
}
