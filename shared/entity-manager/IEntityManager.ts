import type { IEntity } from "../entity/IEntity";

export interface IEntityManager {
  getEntities(): IEntity[];
  addEntity(entity: IEntity): void;
  updateEntity(entity: IEntity): void;
  removeEntity(entity: IEntity): void;
  update(dt: number);
}
