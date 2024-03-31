import type { ITransferEvent } from "./ITransferEvent";

export type TClientTransferEventSubscriber = (event: ITransferEvent) => void;
export type TClientTransferUnsubscribeFn = () => void;

export interface IClientTransfer {
  emit(event: ITransferEvent): void;
  subscribe(
    subscriber: TClientTransferEventSubscriber,
  ): TClientTransferUnsubscribeFn;
}
