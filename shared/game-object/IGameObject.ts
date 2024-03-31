export interface IGameObject {
  type: string;
  width: number;
  height: number;
  update(dt: number): void;
}
