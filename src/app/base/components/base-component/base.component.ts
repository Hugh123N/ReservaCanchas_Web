import { Inject, OnDestroy, ViewContainerRef } from "@angular/core";
// rxjs
import { Observable, Subscription } from "rxjs";
import * as objectPath from "object-path";
import { ResponseBaseDto } from "@base/models/api/response-base.dto";
import Swal from "sweetalert2";
import { ApplicationMessage } from "@base/models/api/application-message.dto";
import { PERMISSIONS } from "@core/config/permissions/permissions";
import { ESTADO_CANCHA } from "@core/constants/constants.constant";
import { FormGroup } from "@angular/forms";

import {
  validateForm as validateFormUtil,
  getFieldError as getFieldErrorUtil,
  isFieldInvalid as isFieldInvalidUtil
} from "@shared/utils/form.utils";

const DEFAULT_DELAY = 5000;

@Inject("BaseComponent")
export abstract class BaseComponent implements OnDestroy {
  readonly ESTADO_CANCHA = ESTADO_CANCHA;
  readonly TITULO_LOGO: string = 'Cancha Reservas';
  public PERMISSIONS: Record<string, string>;
  protected viewContainerRef: ViewContainerRef;
  protected subscriptions: Subscription[] = [];

  constructor(
    module: string,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
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

  openSuccessAlert(result: string | ResponseBaseDto): void {
    const message =
      typeof result === "string" || result instanceof String
        ? result
        : ResponseBaseDto.getMessages(result);

    if (message) this.openSweetAlert("¡Success!", message as string, "success");
  }

  openInfoAlert(result: string | ResponseBaseDto): void {
    const message =
      typeof result === "string" || result instanceof String
        ? result
        : ResponseBaseDto.getMessages(result);

    if (message) this.openSweetAlert("¡Info!", message as string, "info");
  }

  openWarningAlert(result: string | ResponseBaseDto): void {
    const message =
      typeof result === "string" || result instanceof String
        ? result
        : ResponseBaseDto.getMessages(result);

    if (message) this.openSweetAlert("¡Warning!", message as string, "warning");
  }

  openErrorAlert(result: string | ResponseBaseDto): void {
    const message =
      typeof result === "string" || result instanceof String
        ? result
        : ResponseBaseDto.getMessages(result);

    if (message) this.openSweetAlert("¡Error!", message as string, "error");
  }

  openAlert(response: ResponseBaseDto, timeOut = 2000): void {
    if (response == null) return;
    if (response.Messages == null && response.messages == null) return;
    const messages = response.Messages ?? response.messages;

    messages.forEach((message: ApplicationMessage, index: number) => {
      let title = "¡Info!";
      let icon: "success" | "info" | "warning" | "error" = "info";

      const MessageType = message.MessageType ?? message.messageType;
      switch (MessageType) {
        case 0: // Success
          title = "¡Success!";
          icon = "success";
          break;
        case 1: // Info
          title = "¡Info!";
          icon = "info";
          break;
        case 2: // Warning
          title = "¡Warning!";
          icon = "warning";
          break;
        case 3: //¡Error
          title = "¡Error!";
          icon = "error";
          break;
      }
      const Message = message.Message ?? message.message;
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
    icon: "success" | "info" | "warning" | "error"
  ): void {
    Swal.fire({
      position: "center",
      icon,
      title,
      text,
      showConfirmButton: true,
      timer: 2500,
    });
  }

  protected confirmAction(
    title: string,
    text?: string,
    confirmButtonText = "Sí",
    cancelButtonText = "Cancelar",
    icon: "warning" | "question" = "warning"
  ): Promise<boolean> {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText,
      cancelButtonText,
    }).then((result) => result.isConfirmed);
  }

  fetchData<T>(
    serviceCall: Observable<{ isValid: boolean; data: T[] }>,
    targetArray: T[]
  ): void {
    const subscription = serviceCall.subscribe({
      next: (response) => {
        if (response.isValid) {
          targetArray.length = 0;
          targetArray.push(...response.data);
        }
      },
      error: (error) => {
        this.openAlert(error);
      },
    });

    this.subscriptions.push(subscription);
  }

  fetchById<T>(
    serviceCall: Observable<{ isValid: boolean; data: T }>,
    target: (data: T) => void
  ): void {
    const subscription = serviceCall.subscribe({
      next: (response) => {
        if (response.isValid) {
          target(response.data);
        }
      },
      error: (error) => {
        this.openAlert(error);
      },
    });

    this.subscriptions.push(subscription);
  }

  protected validateForm(form: FormGroup): boolean {
    return validateFormUtil(form);
  }
}
