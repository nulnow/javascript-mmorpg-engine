import type { IUser } from "../user/IUser";
import { IEntityManager } from "../entity-manager/IEntityManager";

export interface IMod {
  setEntityManager(entityManager: IEntityManager): void;
  onInit(): void;
  onUserConnected(user: IUser): void;
  onUserDisconnected(user: IUser): void;
}
