import type { IServerTransfer } from "../../shared/transfer/IServerTransfer";
import { IEntity } from "../../shared/entity/IEntity";
import { IClientTransfer } from "../../shared/transfer/IClientTransfer";

export class ServerOfflineTransfer implements IServerTransfer {
  private clientTransfer: IClientTransfer;

  public constructor(clientTransfer: IClientTransfer) {
    this.clientTransfer = clientTransfer;
  }

  public addEntity(entity: IEntity): void {
    this.clientTransfer.emit({ type: "entity_added", data: entity });
  }

  public removeEntity(entity: IEntity): void {
    this.clientTransfer.emit({ type: "entity_removed", data: entity });
  }

  public updateEntity(entity: IEntity): void {
    this.clientTransfer.emit({ type: "entity_updated", data: entity });
  }
}
