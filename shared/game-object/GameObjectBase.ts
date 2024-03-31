import { IGameObject } from "./IGameObject";

export class GameObjectBase implements IGameObject {
  height: number;
  type: string;
  width: number;
  public update(dt: number): void {}
}
