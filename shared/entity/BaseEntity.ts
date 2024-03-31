import { IEntity } from "./IEntity";
import { IGameObject } from "../game-object/IGameObject";
import { SimpleGameObject } from "../game-object/SimpleGameObject";
import { IController } from "../controller/IController";
import { NullController } from "../controller/NullController";
import { IEntityManager } from "../entity-manager/IEntityManager";
import { BehaviourSubject } from "../behaviour-subject/BehaviourSubject";

export class BaseEntity extends BehaviourSubject<number> implements IEntity {
  public id = 0;
  public name = "";

  private _accelerationPixInSecond = 0;
  public get accelerationPixInSecond(): number {
    return this._accelerationPixInSecond;
  }
  public set accelerationPixInSecond(value: number) {
    this._accelerationPixInSecond = value;
    this.emitUpdate();
  }

  private _position: [number, number] = [0, 0];
  public get position(): [number, number] {
    return this._position;
  }

  public set position(value: [number, number]) {
    this._position = value;
    this.emitUpdate();
  }

  private _rotationInRadian = 0;
  public get rotationInRadian(): number {
    return this._rotationInRadian;
  }
  public set rotationInRadian(value: number) {
    this._rotationInRadian = value;
    this.emitUpdate();
  }

  private _speedPixInSecond = 0;
  public get speedPixInSecond(): number {
    return this._speedPixInSecond;
  }
  public set speedPixInSecond(value: number) {
    this._speedPixInSecond = value;
    this.emitUpdate();
  }

  public skills = [];
  public inventory = { items: [] };

  public controller: IController = new NullController();
  public gameObject: IGameObject = new SimpleGameObject("", 0, 0);

  private emitUpdate(): void {
    this.setValue(Math.random());
  }

  public constructor(
    protected entityManager: IEntityManager,
    id: number,
  ) {
    super(0);
    this.id = id;
  }

  public update(dt: number): void {
    this.speedPixInSecond =
      this.speedPixInSecond + (this.accelerationPixInSecond / 1000) * dt;
    const travelledDistance = (this.speedPixInSecond / 1000) * dt;

    const travelledDistanceX =
      Math.cos(this.rotationInRadian) * travelledDistance;
    const travelledDistanceY =
      Math.sin(this.rotationInRadian) * travelledDistance;

    this.position[0] += travelledDistanceX;
    this.position[1] += travelledDistanceY;

    // console.log({ travelledDistance });

    this.gameObject.update(dt);
    this.controller.update(dt);

    if (travelledDistance) {
      this.emitUpdate();
    }
  }

  public destructor(): void {
    this.controller.destructor();
  }
}
