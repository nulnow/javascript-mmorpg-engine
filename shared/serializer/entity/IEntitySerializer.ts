import { ISerializer } from "../ISerializer";
import { IEntity } from "../../entity/IEntity";

export interface IEntitySerializer<T = string>
  extends ISerializer<IEntity, T> {}
