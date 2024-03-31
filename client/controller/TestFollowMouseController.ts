import { IController } from "../../shared/controller/IController";
import { BehaviourSubject } from "../../shared/behaviour-subject/BehaviourSubject";
import { IEntity } from "../../shared/entity/IEntity";

function getAngle(cx, cy, ex, ey): number {
  const dy = ey - cy;
  const dx = ex - cx;
  return Math.atan2(dy, dx);
}

function getDistance(x1, y1, x2, y2): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export class TestFollowMouseController implements IController {
  private mousePositionSubject = new BehaviourSubject({ x: 0, y: 0 });

  public constructor(
    private canvas: HTMLCanvasElement,
    private entity: IEntity,
  ) {
    window.addEventListener("mousemove", this.mouseMoveEventHandler);
    this.entity.speedPixInSecond = 0;
  }

  private mouseMoveEventHandler = (event: MouseEvent): void => {
    this.mousePositionSubject.setValue({
      x: event.clientX,
      y: event.clientY,
    });
  };

  private MAX_SPEED_PX_IN_SEC = 60;
  private MIN_DISTANCE_PX = 60;

  public update(dt: number): void {
    const boundingClientRect = this.canvas.getBoundingClientRect();
    const { x, y } = this.mousePositionSubject.getValue();
    const relativeMouseX = x - boundingClientRect.x;
    const relativeMouseY = y - boundingClientRect.y;

    const angle = getAngle(
      this.entity.position[0],
      this.entity.position[1],
      relativeMouseX,
      relativeMouseY,
    );
    this.entity.rotationInRadian = angle;

    const distance = getDistance(
      this.entity.position[0],
      this.entity.position[1],
      relativeMouseX,
      relativeMouseY,
    );

    if (distance < this.MIN_DISTANCE_PX) {
      this.entity.accelerationPixInSecond = 0;
      this.entity.speedPixInSecond = 0;
      return;
    }

    this.entity.accelerationPixInSecond = distance / 10;
    if (this.entity.speedPixInSecond >= this.MAX_SPEED_PX_IN_SEC) {
      this.entity.accelerationPixInSecond = 0;
      this.entity.speedPixInSecond = this.MAX_SPEED_PX_IN_SEC;
    }

    // this.entity.position[0] = nextPositionX;
    // this.entity.position[1] = nextPositionY;
  }

  public destructor(): void {
    window.removeEventListener("mousemove", this.mouseMoveEventHandler);
  }
}
