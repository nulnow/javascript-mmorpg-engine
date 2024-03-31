import type { IServerTransfer } from "../../shared/transfer/IServerTransfer";
import type { IEntity } from "../../shared/entity/IEntity";

export class ServerOnlineTransfer implements IServerTransfer {
  public addEntity(entity: IEntity): void {}

  public removeEntity(entity: IEntity): void {}

  public updateEntity(entity: IEntity): void {}
}
