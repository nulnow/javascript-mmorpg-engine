import { ISprite } from "./ISprite";

export interface IAssetManager {
  loadAllAssets(): Promise<void>;
  getSpriteByName(name: string): ISprite;
}
