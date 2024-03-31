import type { IEntityManager } from "../shared/entity-manager/IEntityManager";
import {
  IClientTransfer,
  TClientTransferEventSubscriber,
  TClientTransferUnsubscribeFn,
} from "../shared/transfer/IClientTransfer";
import { DefaultEntityManager } from "../shared/entity-manager/DefaultEntityManager";
import { ITransferEvent } from "../shared/transfer/ITransferEvent";

export class ClientEntityManager
  extends DefaultEntityManager
  implements IEntityManager
{
  private clientTransfer: IClientTransfer;
  private transferEventUnsubscribeFn: TClientTransferUnsubscribeFn;

  public constructor(clientTransfer: IClientTransfer) {
    super();
    this.clientTransfer = clientTransfer;

    this.transferEventUnsubscribeFn = this.clientTransfer.subscribe(
      this.transferEventSubscriber,
    );
  }

  private transferEventSubscriber: TClientTransferEventSubscriber = (
    event: ITransferEvent,
  ) => {
    console.log(
      "ClientEntityManager got a event.type",
      event.type,
      event.data.id,
      event.data,
    );
    switch (event.type) {
      case "entity_added": {
        this.addEntity(event.data);
        break;
      }
      case "entity_updated": {
        this.updateEntity(event.data);
        break;
      }
      case "entity_removed": {
        this.removeEntity(event.data);
        break;
      }
      default: {
        throw new Error(
          "ClientEntityManager: Unknown event type: " + event.type,
        );
      }
    }
  };

  public destructor(): void {}
}
