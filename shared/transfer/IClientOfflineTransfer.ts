import type { IClientTransfer } from "./IClientTransfer";
import type { ITransferEvent } from "./ITransferEvent";

export interface IClientOfflineTransfer extends IClientTransfer {
  emit(event: ITransferEvent): void;
}
