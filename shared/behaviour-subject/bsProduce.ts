import { BehaviourSubject } from "./BehaviourSubject";
import { produce, Draft } from "immer";

export const bsProduce = <T>(
  bs: BehaviourSubject<T>,
  producer: (arg: Draft<T>) => void,
): void => {
  bs.setValue(
    produce(bs.getValue(), (draft) => {
      producer(draft);
    }),
  );
};
