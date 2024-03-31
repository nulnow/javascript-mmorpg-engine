import type { ITicker, ITickerSubscriberFn } from "./ITicker";

export class IntervalTicker implements ITicker {
  private readonly tickPerSecond: number;
  private interval: number | NodeJS.Timeout;

  public constructor(tickPerSecond: number = 60) {
    this.tickPerSecond = tickPerSecond;
  }

  public subscribe(subscriber: ITickerSubscriberFn) {
    let prevTime = performance.now();

    this.interval = setInterval(() => {
      const now = performance.now();
      subscriber(now - prevTime);
      prevTime = now;
    }, this.tickPerSecond);

    return () => {
      clearInterval(this.interval);
    };
  }
}
