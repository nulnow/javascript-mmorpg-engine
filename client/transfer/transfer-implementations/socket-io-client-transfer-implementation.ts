import {
  IClientTransfer,
  TClientTransferEventSubscriber,
  TClientTransferUnsubscribeFn,
} from "../../../shared/transfer/IClientTransfer";
import {
  ITransferEvent,
  TTransferEventType,
} from "../../../shared/transfer/ITransferEvent";
import { io, Socket } from "socket.io-client";
import { IEntitySerializer } from "../../../shared/serializer/entity/IEntitySerializer";

export class SocketIoClientTransferImplementation implements IClientTransfer {
  private subscribers: TClientTransferEventSubscriber[] = [];

  // TODO
  public socket: Socket;

  public constructor(private entitySerializer: IEntitySerializer) {}

  public setUpConnection(url: string): void {
    this.socket = io(url);

    const entityAddedEventType: TTransferEventType = "entity_added";
    const entityUpdatedEventType: TTransferEventType = "entity_updated";
    const entityRemovedEventType: TTransferEventType = "entity_removed";

    this.socket.on("connect", () => {
      console.log("connected!");
    });

    this.socket.on("disconnect", () => {
      // todo remove all
    });

    this.socket.on(entityAddedEventType, (data) => {
      this.emit({
        type: entityAddedEventType,
        data: this.entitySerializer.deserialize(data),
      });
    });

    this.socket.on(entityUpdatedEventType, (data) => {
      this.emit({
        type: entityUpdatedEventType,
        data: this.entitySerializer.deserialize(data),
      });
    });

    this.socket.on(entityRemovedEventType, (data) => {
      this.emit({
        type: entityRemovedEventType,
        data: this.entitySerializer.deserialize(data),
      });
    });
  }

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
