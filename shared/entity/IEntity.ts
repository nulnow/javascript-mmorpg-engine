import type { IGameObject } from "../game-object/IGameObject";
import { IController } from "../controller/IController";
import { ISkill } from "./skills/ISkill";
import { IInventory } from "./inventory/IInventory";

export type TEntityId = number;

export interface IEntity {
  id: TEntityId;
  name: string;

  position: [number, number];
  speedPixInSecond: number;
  rotationInRadian: number;
  accelerationPixInSecond: number;

  skills: ISkill[];
  inventory: IInventory;

  gameObject: IGameObject;
  controller: IController;

  update(dt: number): void;
  destructor(): void;
}
