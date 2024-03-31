import { DefaultOfflineCanvasSceneRunner } from "./scene/DefaultOfflineCanvasSceneRunner";
import { SimpleGameObject } from "../shared/game-object/SimpleGameObject";
import { BaseEntity } from "../shared/entity/BaseEntity";
import { TestFollowMouseController } from "./controller/TestFollowMouseController";
import { TestKeyboardController } from "./controller/TestKeyboardController";

class MyEntity extends BaseEntity {
  public constructor(
    color: string = "green",
    width: number = 100,
    height: number = 100,
    speed = 0,
  ) {
    super(null, 0);
    this.gameObject = new SimpleGameObject(color, width, height);
  }
}

class DemoCanvasSceneRunner extends DefaultOfflineCanvasSceneRunner {
  public constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    // this.serverEntityManager.addEntity(new RedSquareEntity());
    const redSquareEntity = new MyEntity("red", 100, 100, 0);
    redSquareEntity.controller = new TestFollowMouseController(
      canvas,
      redSquareEntity,
    );
    this.serverEntityManager.addEntity(redSquareEntity);

    const greenSquareEntity = new MyEntity("green", 100, 100, 0);
    greenSquareEntity.controller = new TestKeyboardController(
      greenSquareEntity,
    );
    this.serverEntityManager.addEntity(greenSquareEntity);
  }
}

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const demoCanvasSceneRunner = new DemoCanvasSceneRunner(canvas);

demoCanvasSceneRunner.start();
