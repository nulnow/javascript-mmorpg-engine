import { IController } from "./IController";

export class NullController implements IController {
  public update(dt: number): void {}

  public destructor(): void {}
}
