import type {
  IClientTransfer,
  TClientTransferEventSubscriber,
  TClientTransferUnsubscribeFn,
} from "../../shared/transfer/IClientTransfer";
import { ITransferEvent } from "../../shared/transfer/ITransferEvent";

export class ClientOnlineTransfer implements IClientTransfer {
  private subscribers: TClientTransferEventSubscriber[] = [];

  public emit(event: ITransferEvent): void {
    for (const subscriber of this.subscribers) {
      subscriber(event);
    }
  }

  public subscribe(
    subscriber: TClientTransferEventSubscriber,
  ): TClientTransferUnsubscribeFn {
    this.subscribers.push(subscriber);

    return () => {
      this.subscribers.filter((l) => l !== subscriber);
    };
  }
}
