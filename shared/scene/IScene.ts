import { IEntity } from "../entity/IEntity";

export interface IScene {
  getEntities(): IEntity[];
}
