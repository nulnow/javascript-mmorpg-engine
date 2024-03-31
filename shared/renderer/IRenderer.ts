import { IClientScene } from "../../client/scene/IClientScene";

export interface IRenderer {
  render(scene: IClientScene);
}
