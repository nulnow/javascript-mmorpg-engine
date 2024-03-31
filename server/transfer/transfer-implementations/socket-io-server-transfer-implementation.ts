import { IServerTransfer } from "../../../shared/transfer/IServerTransfer";
import { IEntity } from "../../../shared/entity/IEntity";
import { Server } from "socket.io";
import { TTransferEventType } from "../../../shared/transfer/ITransferEvent";
import { IEntitySerializer } from "../../../shared/serializer/entity/IEntitySerializer";

export class SocketIoServerTransferImplementation implements IServerTransfer {
  public constructor(
    private io: Server,
    private entitySerializer: IEntitySerializer,
  ) {}

  public addEntity(entity: IEntity): void {
    const eventName: TTransferEventType = "entity_added";
    this.io.emit(eventName, this.entitySerializer.serialize(entity));
  }

  public updateEntity(entity: IEntity): void {
    const eventName: TTransferEventType = "entity_updated";
    this.io.emit(eventName, this.entitySerializer.serialize(entity));
  }

  public removeEntity(entity: IEntity): void {
    const eventName: TTransferEventType = "entity_removed";
    this.io.emit(eventName, this.entitySerializer.serialize(entity));
  }
}
