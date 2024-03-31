import { IRenderer } from "./IRenderer";
import { IClientScene } from "../../client/scene/IClientScene";
import { IEntity } from "../entity/IEntity";
import { ICamera } from "../camera/ICamera";
import { SimpleGameObject } from "../game-object/SimpleGameObject";
import { SpriteGameObject } from "../game-object/SpriteGameObject";
import { AssetManager } from "../asset-manager/AssetManager";

export class DefaultCanvasRenderer implements IRenderer {
  protected htmlCanvasElement: HTMLCanvasElement;
  protected context2d: CanvasRenderingContext2D;

  public constructor(htmlCanvasElement: HTMLCanvasElement) {
    this.htmlCanvasElement = htmlCanvasElement;
    this.context2d = htmlCanvasElement.getContext("2d");
    this.context2d.imageSmoothingEnabled = false;
  }

  public render(scene: IClientScene): void {
    const camera = scene.camera;
    const zoom = camera.zoom;

    this.context2d.save();
    this.context2d.clearRect(0, 0, camera.width * zoom, camera.height * zoom);
    this.context2d.fillStyle = "rgb(0, 0, 0)";
    this.context2d.fillRect(0, 0, camera.width, camera.height);
    this.context2d.restore();

    for (const entity of scene.getEntities()) {
      this.renderEntity(entity, camera);
    }
  }

  // todo use camera
  protected renderEntity(entity: IEntity, camera: ICamera): void {
    const gameObject = entity.gameObject;
    const zoom = camera.zoom;

    if (gameObject instanceof SimpleGameObject) {
      this.context2d.save();
      this.context2d.fillStyle = gameObject.color;

      this.context2d.fillRect(
        entity.position[0] * zoom,
        entity.position[1] * zoom,

        gameObject.width * zoom,
        gameObject.height * zoom,
      );

      this.context2d.restore();
    } else if (gameObject instanceof SpriteGameObject) {
      this.context2d.save();
      this.context2d.fillStyle = "red";

      const image =
        gameObject.sprite[gameObject.currentAnimationIndex[0]][
          gameObject.currentAnimationIndex[1]
        ];

      if (image) {
        let imageToUse = image;
        const isRight = Math.cos(entity.rotationInRadian) > 0;

        if (isRight) {
          imageToUse = AssetManager.flippedImagesMap.get(image);
        }

        this.context2d.drawImage(
          imageToUse || image,
          entity.position[0] * zoom,
          entity.position[1] * zoom,

          gameObject.width * zoom,
          gameObject.height * zoom,
        );
      } else {
        console.error("DefaultCanvasRenderer::renderEntity : Image not found");
      }

      // this.context2d.strokeStyle = "red";
      // this.context2d.strokeRect(
      //   entity.position[0],
      //   entity.position[1],
      //
      //   gameObject.width,
      //   gameObject.height,
      // );

      // this.context2d.stroke();

      this.context2d.restore();
    }
  }
}
