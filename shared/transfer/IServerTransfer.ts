import type { IEntity } from "../entity/IEntity";

export interface IServerTransfer {
  addEntity(entity: IEntity): void;
  updateEntity(entity: IEntity): void;
  removeEntity(entity: IEntity): void;

  // TODO:MINOR_REFACTOR - make it mandatory
  destructor?(): void;
}
