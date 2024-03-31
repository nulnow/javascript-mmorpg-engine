import { ICamera } from "../../shared/camera/ICamera";
import { IClientScene } from "./IClientScene";
import { BehaviourSubject } from "../../shared/behaviour-subject/BehaviourSubject";
import { ITicker, IUnsubscribeFromTickerFn } from "../../shared/ticker/ITicker";
import { AnimationFrameTicker } from "../../shared/ticker/AnimationFrameTicker";
import { ClientOfflineTransfer } from "../transfer/client-offline-transfer";
import { IEntityManager } from "../../shared/entity-manager/IEntityManager";
import { ClientEntityManager } from "../ClientEntityManager";
import { IServerTransfer } from "../../shared/transfer/IServerTransfer";
import { ServerOfflineTransfer } from "../../server/transfer/server-offline-transfer";
import { ServerEntityManager } from "../../server/ServerEntityManager";
import { IRenderer } from "../../shared/renderer/IRenderer";
import { DefaultCanvasRenderer } from "../../shared/renderer/DefaultCanvasRenderer";
import { IClientTransfer } from "../../shared/transfer/IClientTransfer";
import { IEntity } from "../../shared/entity/IEntity";

export const defaultWindowSizeSubject = new BehaviourSubject({
  width: window.innerWidth,
  height: window.innerHeight,
});
window.addEventListener("resize", () => {
  defaultWindowSizeSubject.setValue({
    width: window.innerWidth,
    height: window.innerHeight,
  });
});

export class DefaultOfflineCanvasSceneRunner {
  protected camera: ICamera;
  protected scene: IClientScene;
  protected ticker: ITicker = new AnimationFrameTicker();

  // TODO
  public clientTransfer: IClientTransfer;
  protected clientEntityManager: IEntityManager;
  protected serverOfflineTransfer: IServerTransfer;
  protected serverEntityManager: IEntityManager;
  protected canvas: HTMLCanvasElement;
  protected renderer: IRenderer;
  protected stopTickerFn: IUnsubscribeFromTickerFn;

  public constructor(
    protected sizeSubject: BehaviourSubject<{
      width: number;
      height: number;
    }> = defaultWindowSizeSubject,
  ) {}

  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  protected setUp(): void {
    this.camera = {
      width: window.innerWidth,
      height: window.innerHeight,
      zoom: 1,

      x: 0,
      y: 0,
    };

    this.scene = {
      camera: this.camera,
      getEntities: () => {
        return this.clientEntityManager.getEntities();
      },
    };

    this.clientTransfer = new ClientOfflineTransfer();
    this.clientEntityManager = new ClientEntityManager(this.clientTransfer);

    this.serverOfflineTransfer = new ServerOfflineTransfer(this.clientTransfer);
    this.serverEntityManager = new ServerEntityManager(
      this.serverOfflineTransfer,
    );

    this.canvas.width = this.sizeSubject.getValue().width;
    this.canvas.height = this.sizeSubject.getValue().height;

    this.sizeSubject.subscribe(() => {
      const { width, height } = this.sizeSubject.getValue();
      this.canvas.width = width;
      this.canvas.height = height;

      this.camera.width = width;
      this.camera.height = height;
    });

    this.renderer = this.initRenderer();
  }

  protected initRenderer(): IRenderer {
    return new DefaultCanvasRenderer(this.canvas);
  }

  private isSetUp = false;

  public start(): void {
    if (!this.isSetUp) {
      this.setUp();
      this.isSetUp = true;
    }

    this.stopTickerFn = this.ticker.subscribe((dt) => {
      if (!this.paused) {
        this.serverEntityManager.update(dt);
        this.clientEntityManager.update(dt);
      }
      this.renderer.render(this.scene);
    });
  }

  private paused = false;

  public isPaused(): boolean {
    return this.paused;
  }

  public pause(): void {
    this.paused = true;
  }
  public unpause(): void {
    this.paused = false;
  }

  public stop(): void {
    if (this.stopTickerFn) {
      this.stopTickerFn();
    }
  }

  public destructor(): void {
    this.isSetUp = false;

    if (this.scene) {
      for (const entity of this.scene.getEntities()) {
        entity.destructor();
        this.serverEntityManager.removeEntity(entity);
      }

      this.renderer.render({
        getEntities(): IEntity[] {
          return [];
        },
        camera: {
          x: 0,
          y: 0,
          width: this.canvas.width,
          height: this.canvas.height,
          zoom: 0,
        },
      });
    }

    this.stop();
  }
}
