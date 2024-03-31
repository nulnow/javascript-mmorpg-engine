import { IEntityManager } from "./IEntityManager";
import { IEntity } from "../entity/IEntity";

export class DefaultEntityManager implements IEntityManager {
  protected entities: IEntity[] = [];

  public getEntities(): IEntity[] {
    return this.entities;
  }

  public addEntity(entityToAdd: IEntity): void {
    this.entities.push(entityToAdd);
  }

  public updateEntity(entityToUpdate: IEntity): void {
    for (const index in this.entities) {
      const currentEntity = this.entities[index];
      if (currentEntity.id === entityToUpdate.id) {
        this.entities[index] = entityToUpdate;
      }
    }
  }

  public removeEntity(entity: IEntity): void {
    const currentEntity = this.entities.find((e) => e.id === entity.id);

    this.entities = this.entities.filter((e) => e.id !== entity.id);

    // todo make mandatory
    currentEntity?.destructor();
  }

  public update(dt: number): void {
    for (const entity of this.entities) {
      entity.update(dt);
    }
  }
}
