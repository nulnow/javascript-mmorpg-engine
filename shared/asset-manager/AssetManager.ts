import { ISprite } from "./ISprite";
import INLINED_ASSETS from "../../client/bin/INLINED_ASSETS.json";

const loadImageData = async (url: string): Promise<HTMLImageElement> => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (event, source, width, height, error) => reject(error);
  });
};

const loadImageDataFromBase64 = async (
  base64: string,
): Promise<HTMLImageElement> => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = "data:image/jpg;base64," + base64;
    image.onload = () => resolve(image);
    image.onerror = (event, source, width, height, error) => reject(error);
  });
};

type IAssetSpriteType = "folder-based";

type IAssetSpriteDirection = "left" | "right";

type IDefaultAnimationName =
  | "attack"
  | "dead"
  | "dying"
  | "hurt"
  | "idle"
  | "move";

type IAssetSprite = {
  name: string;
  url: string;
  base64: string;
};

type IAssetSpriteConfig<T extends string> = Record<
  T,
  {
    sprites: Record<IDefaultAnimationName, IAssetSprite[] | HTMLImageElement[]>;
    config: {
      name: string;
      type: IAssetSpriteType;
      direction: IAssetSpriteDirection;
      animations: ["attack", "dead", "dying", "hurt", "idle", "move"];
    };
  }
>;

type IDefaultSpriteNames = "slime";

export class AssetManager {
  private static spritesConfig: IAssetSpriteConfig<IDefaultSpriteNames>;
  public static flippedImagesMap = new Map<
    HTMLImageElement,
    HTMLImageElement
  >();

  public static flipImage(image: HTMLImageElement): HTMLImageElement {
    if (this.flippedImagesMap.has(image)) {
      return this.flippedImagesMap.get(image);
    }

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const canvasContext = canvas.getContext("2d")!;
    canvasContext.imageSmoothingEnabled = false;

    canvasContext.translate(image.width, 0);
    canvasContext.scale(-1, 1);
    canvasContext.drawImage(image, 0, 0, image.width, image.height);
    const flippedImage = new Image();
    flippedImage.src = canvas.toDataURL();

    this.flippedImagesMap.set(image, flippedImage);

    return flippedImage;
  }

  public static async loadAllAssets(): Promise<void> {
    Promise.resolve(INLINED_ASSETS)
      // TODO Api
      // await fetch("http://localhost:3000/sprites-config")
      //   .then((res) => res.json())
      .then(async (spritesConfig: IAssetSpriteConfig<IDefaultSpriteNames>) => {
        const populatedConfig = spritesConfig;

        const promises = [];

        for (const key in populatedConfig) {
          const { sprites } =
            populatedConfig[key as keyof typeof populatedConfig];

          for (const spritesKey in sprites) {
            const animations: IAssetSprite[] = sprites[
              spritesKey as keyof typeof sprites
            ] as IAssetSprite[];

            for (const animationsKey in animations) {
              const animation: IAssetSprite = animations[
                animationsKey as keyof typeof animations
              ] as IAssetSprite;

              promises.push(
                loadImageDataFromBase64(
                  (animation as IAssetSprite).base64,
                ).then(async (image) => {
                  populatedConfig[key as keyof typeof populatedConfig].sprites[
                    spritesKey as keyof typeof sprites
                  ][animationsKey] = image;
                  this.flippedImagesMap.set(
                    image,
                    AssetManager.flipImage(image),
                  );
                }),
              );
            }
          }
        }

        await Promise.all(promises);
        this.spritesConfig = populatedConfig;
      });
  }

  public static getSpriteByName(name: IDefaultSpriteNames): ISprite {
    return this.spritesConfig[name].sprites as ISprite;
  }
}
