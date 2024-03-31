export type TBehaviourSubjectSubscriber<T> = (newValue: T) => void;
export type TBehaviourSubjectUnsubscribeFn = () => void;

export class BehaviourSubject<T> {
  private value;
  private subscribers: TBehaviourSubjectSubscriber<T>[] = [];

  public constructor(initialValue: T) {
    this.value = initialValue;
  }

  public getValue(): T {
    return this.value;
  }

  public setValue(newValue: T): void {
    if (newValue === this.value) {
      return;
    }

    this.value = newValue;
    for (const subscriber of this.subscribers) {
      subscriber(newValue);
    }
  }

  public subscribe(
    subscriber: TBehaviourSubjectSubscriber<T>,
  ): TBehaviourSubjectUnsubscribeFn {
    this.subscribers.push(subscriber);

    return () => {
      this.subscribers.filter((s) => s !== subscriber);
    };
  }

  public pipe<G>(transformFN: (data: T) => G): BehaviourSubject<G> {
    const bs = new BehaviourSubject(transformFN(this.getValue()));

    this.subscribe((newValue) => {
      bs.setValue(transformFN(newValue));
    });

    return bs;
  }
}
