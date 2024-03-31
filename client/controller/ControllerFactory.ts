import { IEntity } from "../../shared/entity/IEntity";
import { IController } from "../../shared/controller/IController";
import { NullController } from "../../shared/controller/NullController";
import { TestFollowMouseController } from "./TestFollowMouseController";
import { TestKeyboardController } from "./TestKeyboardController";

export class ControllerFactory {
  public createControllerByType(
    type: string,
    canvas: HTMLCanvasElement,
    entity: IEntity,
  ): IController {
    switch (type) {
      case "NullController":
        return new NullController();
      case "TestFollowMouseController":
        return new TestFollowMouseController(canvas, entity);
      case "TestKeyboardController":
        return new TestKeyboardController(entity);
    }

    throw new Error(
      "ControllerFactory::createControllerByType unknown controller type: " +
        type,
    );
  }
}
