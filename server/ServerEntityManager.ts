import type { IEntityManager } from "../shared/entity-manager/IEntityManager";
import { DefaultEntityManager } from "../shared/entity-manager/DefaultEntityManager";
import type { IEntity } from "../shared/entity/IEntity";
import type { IServerTransfer } from "../shared/transfer/IServerTransfer";

export class ServerEntityManager
  extends DefaultEntityManager
  implements IEntityManager
{
  private serverTransfer: IServerTransfer;

  public constructor(serverTransfer: IServerTransfer) {
    super();
    this.serverTransfer = serverTransfer;
  }

  public addEntity(entityToAdd: IEntity): void {
    super.addEntity(entityToAdd);
    this.serverTransfer.addEntity(entityToAdd);
  }

  public updateEntity(entityToUpdate: IEntity): void {
    super.updateEntity(entityToUpdate);
    this.serverTransfer.updateEntity(entityToUpdate);
  }

  public removeEntity(entity: IEntity): void {
    super.removeEntity(entity);
    this.serverTransfer.removeEntity(entity);
  }
}
