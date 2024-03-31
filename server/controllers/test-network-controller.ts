import { Socket } from "socket.io";
import { IController } from "../../shared/controller/IController";
import { IEntity } from "../../shared/entity/IEntity";
import { IEntityManager } from "../../shared/entity-manager/IEntityManager";
import { SpriteGameObject } from "../../shared/game-object/SpriteGameObject";

function getAngle(cx, cy, ex, ey): number {
  const dy = ey - cy;
  const dx = ex - cx;
  return Math.atan2(dy, dx);
}

export class TestNetworkController implements IController {
  public constructor(
    private socket: Socket,
    private entity: IEntity,
    private mapPlayerEntities: Map<any, any>,
  ) {
    socket.on("message", (msg, data) => {
      if (msg === "keys") {
        console.log("got keys; socket: " + socket.id + " keys: ", data);
        const playerEntity = mapPlayerEntities.get(socket);

        let x = 0;
        let y = 0;
        if (data.w) {
          y -= 1;
          // playerEntity.rotationInRadian = Math.PI * 1.5;
        }
        if (data.a) {
          x -= 1;
          // playerEntity.rotationInRadian = Math.PI * 1;
        }
        if (data.s) {
          y += 1;
          // playerEntity.rotationInRadian = Math.PI * 0.5;
        }
        if (data.d) {
          x += 1;
          // playerEntity.rotationInRadian = Math.PI * 2;
        }

        if (x !== 0 || y !== 0) {
          playerEntity.rotationInRadian = getAngle(0, 0, x, y);
        }

        const go = playerEntity.gameObject as SpriteGameObject;

        if (data.w || data.a || data.s || data.d) {
          playerEntity.speedPixInSecond = 60;

          if (go.currentAnimationIndex[0] !== "move") {
            go.currentAnimationIndex[0] = "move";
            go.currentAnimationIndex[1] = 0;
            go.timeCount = 0;
          }
        } else {
          playerEntity.speedPixInSecond = 0;

          if (go.currentAnimationIndex[0] !== "idle") {
            go.currentAnimationIndex[0] = "idle";
            go.currentAnimationIndex[1] = 0;
            go.timeCount = 0;
          }
        }

        ((entity as any).entityManager as IEntityManager).updateEntity(
          playerEntity,
        );
      }
    });
  }

  public update(dt: number): void {}

  public destructor(): void {}
}
