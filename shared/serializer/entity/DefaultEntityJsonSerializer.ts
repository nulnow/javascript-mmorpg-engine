import { IEntitySerializer } from "./IEntitySerializer";
import { IEntity } from "../../entity/IEntity";
import { BaseEntity } from "../../entity/BaseEntity";
import { SimpleGameObject } from "../../game-object/SimpleGameObject";
import { IGameObject } from "../../game-object/IGameObject";
import { SpriteGameObject } from "../../game-object/SpriteGameObject";
import { IAssetManager } from "../../asset-manager/IAssetManager";

class DeserializedEntity extends BaseEntity {}

export class DefaultEntityJsonSerializer implements IEntitySerializer {
  public constructor(private assetManager: IAssetManager) {}

  public serialize(obj: IEntity): string {
    const serializeGameObject = (go: IGameObject): any => {
      if (!go) {
        return null;
      }

      return {
        type: go.type,
        height: go.height,
        width: go.width,
        // @ts-expect-error todo
        currentAnimationIndex: go.currentAnimationIndex,
        // @ts-expect-error todo serializer for GameObjects
        color: go.color,
        // @ts-expect-error todo
        animationName: go.animationName,

        // @ts-expect-error todo
        animationSpeed: go.animationSpeed,

        // @ts-expect-error todo
        timeCount: go.timeCount,
      };
    };

    return JSON.stringify({
      id: obj.id,

      position: obj.position,
      speedPixInSecond: obj.speedPixInSecond,
      rotationInRadian: obj.rotationInRadian,
      accelerationPixInSecond: obj.accelerationPixInSecond,

      gameObject: serializeGameObject(obj.gameObject),
    });
  }

  public deserialize(str: string): IEntity {
    const parsed = JSON.parse(str);
    const entity = new DeserializedEntity(null, 0);

    const deserializeGameObject = (data: any): any => {
      if (!data) {
        return null;
      }

      if (data.type === "SimpleGameObject") {
        return new SimpleGameObject(data.color, data.width, data.height);
      }

      if (data.type === "SpriteGameObject") {
        const go = new SpriteGameObject(
          data.animationName,
          data.width,
          data.height,
          data.currentAnimationIndex,
          data.animationSpeed,
          this.assetManager,
        );

        go.timeCount = data.timeCount;
        return go;
      }

      throw new Error(
        "DefaultEntityJsonSerializer: Cannot deserialize GameObject " +
          data.type +
          " " +
          JSON.stringify(data),
      );
    };

    entity.id = parsed.id;
    entity.position = parsed.position;
    entity.speedPixInSecond = parsed.speedPixInSecond;
    entity.rotationInRadian = parsed.rotationInRadian;
    entity.accelerationPixInSecond = parsed.accelerationPixInSecond;

    entity.gameObject = deserializeGameObject(parsed.gameObject);

    return entity;
  }
}
