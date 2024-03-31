import { BehaviourSubject } from "../../../shared/behaviour-subject/BehaviourSubject";
import { bsProduce } from "../../../shared/behaviour-subject/bsProduce";

export interface IWindowController {
  View: React.FC<{
    windowManager: WindowManager;
    id: number;
    controller: IWindowController;
  }>;

  send(command: string, data: any): Promise<void>;
  on(command: string, handler: (data: any) => void): () => void;

  title: BehaviourSubject<string>;
  topLeft: BehaviourSubject<{ top: number; left: number }>;
  widthHeight: BehaviourSubject<{ width: number; height: number }>;
}

export interface IWindow {
  id: number;
  controller: IWindowController;
}

export class WindowManager {
  public static centerWindow(controller: IWindowController): void {
    controller.topLeft.setValue({
      top:
        window.innerHeight / 2 - controller.widthHeight.getValue().height / 2,
      left: window.innerWidth / 2 - controller.widthHeight.getValue().width / 2,
    });
  }

  public windowsList = new BehaviourSubject<IWindow[]>([]);

  public windows = this.windowsList.pipe((store) => {
    const result = {};
    for (const win of store) {
      result[win.id] = win;
    }
    return result;
  });

  public focusedWindowId = new BehaviourSubject<number>(0);

  public constructor() {}

  private ids = 0;
  private generateNewWindowId(): number {
    return ++this.ids;
  }

  public addWindow(windowController: IWindowController): IWindow {
    const win: IWindow = {
      id: this.generateNewWindowId(),
      controller: windowController,
    };

    this.windows.setValue({
      ...this.windows.getValue(),
      [win.id]: win,
    });

    bsProduce(this.windowsList, (draft) => {
      draft.push(win);
    });

    this.focusedWindowId.setValue(win.id);

    return win;
  }

  public async closeWindow(id: number): Promise<void> {
    const window = this.windows.getValue()[id];
    if (!window) {
      console.warn(
        "Window manager::closeWindow window with id " + id + " not found",
      );
      return;
    }

    await window.controller.send("exit", null);

    bsProduce(this.windowsList, (draft) => {
      draft.splice(
        draft.findIndex((w) => w.id === window.id),
        1,
      );
    });
  }
}
