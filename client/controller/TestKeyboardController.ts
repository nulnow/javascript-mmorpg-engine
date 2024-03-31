import { IController } from "../../shared/controller/IController";
import { IEntity } from "../../shared/entity/IEntity";

export class TestKeyboardController implements IController {
  private pressedKeys = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  public constructor(private entity: IEntity) {
    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  private keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === "KeyW") this.pressedKeys["w"] = true;
    if (event.code === "KeyA") this.pressedKeys["a"] = true;
    if (event.code === "KeyS") this.pressedKeys["s"] = true;
    if (event.code === "KeyD") this.pressedKeys["d"] = true;
  };

  private keyUpHandler = (event: KeyboardEvent): void => {
    if (event.code === "KeyW") this.pressedKeys["w"] = false;
    if (event.code === "KeyA") this.pressedKeys["a"] = false;
    if (event.code === "KeyS") this.pressedKeys["s"] = false;
    if (event.code === "KeyD") this.pressedKeys["d"] = false;
  };

  public update(dt: number): void {
    if (this.pressedKeys.w) this.entity.rotationInRadian = Math.PI * 1.5;
    if (this.pressedKeys.a) this.entity.rotationInRadian = Math.PI * 1;
    if (this.pressedKeys.s) this.entity.rotationInRadian = Math.PI * 0.5;
    if (this.pressedKeys.d) this.entity.rotationInRadian = Math.PI * 2;

    if (
      this.pressedKeys.w ||
      this.pressedKeys.a ||
      this.pressedKeys.s ||
      this.pressedKeys.d
    ) {
      this.entity.speedPixInSecond = 20;
    } else {
      this.entity.speedPixInSecond = 0;
    }
  }

  public destructor(): void {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
  }
}
