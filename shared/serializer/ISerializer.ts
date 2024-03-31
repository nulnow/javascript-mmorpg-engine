export interface ISerializer<T, G = string> {
  serialize(obj: T): G;
  deserialize(str: G): T;
}
