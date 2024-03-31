import { IGameObject } from "./IGameObject";
import { GameObjectBase } from "./GameObjectBase";
import { IAssetManager } from "../asset-manager/IAssetManager";
import { ISprite } from "../asset-manager/ISprite";

export class SpriteGameObject extends GameObjectBase implements IGameObject {
  type = "SpriteGameObject";

  public sprite: ISprite;

  public constructor(
    public animationName: string,
    public width: number,
    public height: number,
    public currentAnimationIndex: [string, number] = ["", 0],
    public animationSpeed: number,
    assetManager: IAssetManager,
  ) {
    super();
    const sprite = assetManager.getSpriteByName(animationName);

    this.sprite = sprite;
  }

  public timeCount = 0;
  public update(dt: number): void {
    this.timeCount += dt;
    this.currentAnimationIndex[0] = this.currentAnimationIndex[0] || "idle";
    this.currentAnimationIndex[1] =
      Math.floor(this.timeCount / 1000 / this.animationSpeed) %
      this.sprite[this.currentAnimationIndex[0]].length;
  }
}
