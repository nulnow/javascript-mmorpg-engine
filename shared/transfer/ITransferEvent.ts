import { IEntity } from "../entity/IEntity";

export type TTransferEventType =
  | "entity_added"
  | "entity_updated"
  | "entity_removed";

export const serializeEntity = (entity: IEntity): string => {
  return JSON.stringify({ id: entity.id });
};

export const deserializeEntity = (data: string): IEntity => {
  return {
    ...JSON.parse(data),
    update(dt: number) {},
    destructor() {},
  };
};

export interface ITransferEventData extends IEntity {}

export interface ITransferEvent {
  type: TTransferEventType;
  data: ITransferEventData;
}
