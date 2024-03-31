export class EventEmitter {
  private events = {};
  public constructor() {}

  public emit(eventName: string, data: any): void {
    const eventHandlers = this.events[eventName];

    if (eventHandlers) {
      eventHandlers.forEach((fn) => {
        fn(data);
      });
    }
  }

  public subscribe(eventName: string, fn: (data: any) => void): () => void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(fn);

    return () => {
      this.events[eventName] = this.events[eventName].filter(
        (eventFn) => fn !== eventFn,
      );
    };
  }
}
