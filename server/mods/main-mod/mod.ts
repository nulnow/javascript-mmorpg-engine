import { IMod } from "../../../shared/mod/IMod";
import { IUser } from "../../../shared/user/IUser";
import { TestNetworkController } from "../../controllers/test-network-controller";
import { IEntityManager } from "../../../shared/entity-manager/IEntityManager";
import { BaseEntity } from "../../../shared/entity/BaseEntity";
import { SimpleGameObject } from "../../../shared/game-object/SimpleGameObject";
import { SpriteGameObject } from "../../../shared/game-object/SpriteGameObject";
import { ISprite } from "../../../shared/asset-manager/ISprite";
import { DefaultEntityJsonSerializer } from "../../../shared/serializer/entity/DefaultEntityJsonSerializer";
import { IAssetManager } from "../../../shared/asset-manager/IAssetManager";

const getRandomColor = (): string => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return randomColor;
};

class AIEntity extends BaseEntity {
  public constructor(
    entityManager: IEntityManager,
    id: number,
    color: string = "green",
    width: number = 100,
    height: number = 100,
    // speed = 0,
  ) {
    super(entityManager, id);
    this.id = id;
    this.speedPixInSecond = 30;
    this.gameObject = new SimpleGameObject(color, width, height);

    let counter = 0;
    let flip = 1;

    this.controller = {
      update: (dt: number) => {
        let wasChanged = false;
        counter += dt;

        if (counter * Math.random() >= 4000) {
          const randomColor = Math.floor(Math.random() * 16777215).toString(16);
          (<SimpleGameObject>this.gameObject).color =
            "#" + randomColor.toString();
          wasChanged = true;
        }

        if (counter >= 8000) {
          counter = 0;
          this.rotationInRadian = Math.PI * flip;
          flip = flip ? 0 : 1;
          wasChanged = true;
        }

        if (wasChanged) {
          this.entityManager.updateEntity(this);
        }
      },
      destructor() {},
    };
  }
}

class MyPlayerEntity extends BaseEntity {
  public constructor(
    entityManager: IEntityManager,
    socket: any,
    id: number,
    color: string = "green",
    width: number = 100,
    height: number = 100,
    // speed = 0,
  ) {
    super(entityManager, id);
    this.id = id;
    this.speedPixInSecond = 0;
  }
}

const serverAssetManager: IAssetManager = {
  loadAllAssets: function (): Promise<void> {
    throw new Error("Function not implemented.");
  },

  getSpriteByName(name: string): ISprite {
    return { idle: ["", "", "", ""] as any, move: ["", "", "", ""] as any };
  },
};

export class MainMod implements IMod {
  private entityManager: IEntityManager;
  private mapPlayerEntities = new Map();

  public setEntityManager(entityManager: IEntityManager): void {
    this.entityManager = entityManager;
  }

  public constructor() {}

  public onInit(): void {
    // const greenEntity = new AIEntity(
    //   this.entityManager,
    //   Math.round(1000 * Math.random()),
    // );
    // this.entityManager.addEntity(greenEntity);

    setInterval(() => {
      this.sockets.forEach((socket) => {
        socket.emit(
          "debug:server_entities",
          this.entityManager
            .getEntities()
            .map((e) => new DefaultEntityJsonSerializer(null).serialize(e))
            .map((x) => JSON.parse(x)),
        );
      });
    }, 50);
  }

  private ids = 10;
  private sockets: any[] = [];
  public onUserConnected(user: IUser): void {
    const socket = user as any;

    this.sockets.push(socket);

    const playerEntity = new MyPlayerEntity(
      this.entityManager,
      socket,
      this.ids++,
      "#" + getRandomColor(),
    );
    playerEntity.gameObject = new SpriteGameObject(
      "slime",
      40,
      40,
      ["idle", 0],
      0.25,
      serverAssetManager,
    );
    playerEntity.controller = new TestNetworkController(
      socket,
      playerEntity,
      this.mapPlayerEntities,
    );
    // socketIoServerTransferImplementation.addEntity(playerEntity);
    this.entityManager.addEntity(playerEntity);
    this.mapPlayerEntities.set(socket, playerEntity);
  }

  public onUserDisconnected(user: IUser): void {
    this.sockets = this.sockets.filter((s) => s !== user);
    this.entityManager.removeEntity(this.mapPlayerEntities.get(user));
  }
}
