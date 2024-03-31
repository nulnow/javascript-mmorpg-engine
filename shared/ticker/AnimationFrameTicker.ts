import type { ITicker, ITickerSubscriberFn } from "./ITicker";

export class AnimationFrameTicker implements ITicker {
  private initialTime = 0;
  private stoppedAt = 0;

  public subscribe(subscriber: ITickerSubscriberFn) {
    let animationFrameId: number;

    const run = (): void => {
      animationFrameId = window.requestAnimationFrame((timePassed: number) => {
        if (this.stoppedAt) {
          this.initialTime = performance.now();
          this.stoppedAt = 0;
        }

        const dt = timePassed - this.initialTime;
        subscriber(dt);
        this.initialTime = timePassed;
        run();
      });
    };

    run();

    return () => {
      this.stoppedAt = performance.now();
      window.cancelAnimationFrame(animationFrameId);
    };
  }
}
