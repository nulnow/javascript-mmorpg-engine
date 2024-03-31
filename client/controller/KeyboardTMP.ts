export class KeyboardTMP {
  private pressedKeys = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  subs = [];

  public constructor() {
    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
    window.addEventListener("blur", () => {
      let wasChanged = false;

      if (
        this.pressedKeys.w ||
        this.pressedKeys.a ||
        this.pressedKeys.s ||
        this.pressedKeys.d
      ) {
        wasChanged = true;
      }

      this.pressedKeys.w = false;
      this.pressedKeys.a = false;
      this.pressedKeys.s = false;
      this.pressedKeys.d = false;

      if (wasChanged) {
        this.emit();
      }
    });
  }

  public subscribe(sub) {
    this.subs.push(sub);
    return () => {
      this.subs = this.subs.filter((s) => s !== sub);
    };
  }

  private emit(): void {
    this.subs.forEach((s) => s(this.pressedKeys));
  }

  private keyDownHandler = (event: KeyboardEvent): void => {
    if (event.repeat) {
      return;
    }
    if (event.code === "KeyW") this.pressedKeys["w"] = true;
    if (event.code === "KeyA") this.pressedKeys["a"] = true;
    if (event.code === "KeyS") this.pressedKeys["s"] = true;
    if (event.code === "KeyD") this.pressedKeys["d"] = true;
    this.emit();
  };

  private keyUpHandler = (event: KeyboardEvent): void => {
    if (event.repeat) {
      return;
    }
    if (event.code === "KeyW") this.pressedKeys["w"] = false;
    if (event.code === "KeyA") this.pressedKeys["a"] = false;
    if (event.code === "KeyS") this.pressedKeys["s"] = false;
    if (event.code === "KeyD") this.pressedKeys["d"] = false;
    this.emit();
  };

  public destructor(): void {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
  }
}
