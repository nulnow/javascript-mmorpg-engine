import type { IScene } from "../../shared/scene/IScene";
import { ICamera } from "../../shared/camera/ICamera";

export interface IClientScene extends IScene {
  camera: ICamera;
}
