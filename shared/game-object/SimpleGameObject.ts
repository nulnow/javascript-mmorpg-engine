import type { IGameObject } from "./IGameObject";
import { GameObjectBase } from "./GameObjectBase";

export class SimpleGameObject extends GameObjectBase implements IGameObject {
  type = "SimpleGameObject";

  public constructor(
    public color: string,
    public width: number,
    public height: number,
  ) {
    super();
  }
}
