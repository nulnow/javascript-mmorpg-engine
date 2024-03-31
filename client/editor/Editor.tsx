import React, { useEffect, useMemo, useRef, useState } from "react";
import { SceneRenderer } from "../components/SceneRenderer";
import { DefaultOfflineCanvasSceneRunner } from "../scene/DefaultOfflineCanvasSceneRunner";
import { BaseEntity } from "../../shared/entity/BaseEntity";
import { SimpleGameObject } from "../../shared/game-object/SimpleGameObject";
import { IRenderer } from "../../shared/renderer/IRenderer";
import { DefaultCanvasRenderer } from "../../shared/renderer/DefaultCanvasRenderer";
import { IEntity } from "../../shared/entity/IEntity";
import { ICamera } from "../../shared/camera/ICamera";
import { BehaviourSubject } from "../../shared/behaviour-subject/BehaviourSubject";
import { IClientScene } from "../scene/IClientScene";
import { useBehaviourSubject } from "../bin/start-client";
import { SpriteGameObject } from "../../shared/game-object/SpriteGameObject";
import { AssetManager } from "../../shared/asset-manager/AssetManager";
import { ControllerFactory } from "../controller/ControllerFactory";
import { IWindow, WindowManager } from "./window-manager/WindowManager";
import { uiHeaderHeight, UIPanel, Window } from "./ui-components/ui-components";
import { useHover } from "../hooks/useHover";
import { DefaultWindowController } from "./window-manager/DefaultWindow";
import { bsProduce } from "../../shared/behaviour-subject/bsProduce";
import { Switch } from "./ui-components/Switch";
import { KeyRecorder } from "./ui-components/KeyRecorder";
import { EntitiesListController } from "./entities-list/EntitiesList";
import { SceneControlsController } from "./scene-controls/SceneControls";
import { LibraryController } from "./library/Library";
import { themeSubject } from "./theme";

const isIntersect = (
  a: { x1: number; x2: number; y1: number; y2: number },
  b: { x1: number; x2: number; y1: number; y2: number },
): boolean => {
  return !(b.x1 < a.x1 || b.y1 < a.y1 || b.x2 > a.x2 || b.y2 > a.y2);
};

const keymapSubject = new BehaviourSubject({
  "Entities list": {
    description: "Open entities list",
    keys: [{ ctrlKey: true, code: "KeyE" }],
  },
  "Scene controls": {
    description: "Open scene controls",
    keys: [{ ctrlKey: true, code: "KeyS" }],
  },
  Library: {
    description: "Open library",
    keys: [{ ctrlKey: true, code: "KeyL" }],
  },
  Settings: {
    description: "Open settings window",
    keys: [{ ctrlKey: true, code: "Comma" }],
  },
  "Window Manager": {
    description: "Open window manager",
    keys: [{ ctrlKey: true, code: "KeyM" }],
  },
  "Close Window": {
    description: "Close current window",
    keys: [{ ctrlKey: true, code: "KeyW" }],
  },
  Help: {
    description: "Open help window",
    keys: [{ ctrlKey: true, code: "KeyH" }],
  },
});

export class EditorSceneRunner extends DefaultOfflineCanvasSceneRunner {
  private mouseBehaviourSubject = new BehaviourSubject({ x: 0, y: 0 });

  private canvasRelatedMouseCoordinatesBehaviourSubject = (() => {
    const canvasRelatedMouseCoordinatesBehaviourSubject = new BehaviourSubject({
      x: 0,
      y: 0,
    });

    this.mouseBehaviourSubject.subscribe((newValue) => {
      if (!this.canvas) {
        return;
      }
      const { x, y } = this.canvas.getBoundingClientRect();
      canvasRelatedMouseCoordinatesBehaviourSubject.setValue({
        x: newValue.x - x,
        y: newValue.y - y,
      });
    });

    return canvasRelatedMouseCoordinatesBehaviourSubject;
  })();

  public selectedEntityBehaviourSubject = new BehaviourSubject<IEntity | null>(
    null,
  );

  public entitiesBehaviourSubject = new BehaviourSubject<IEntity[]>([]);

  public constructor(private windowManager: WindowManager) {
    super();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getEntities(): IEntity[] {
    if (!this.serverEntityManager) {
      return [];
    }

    return this.serverEntityManager.getEntities();
  }

  public getCamera(): ICamera | null {
    return this.camera;

    // if (!this.serverEntityManager) {
    //   return [];
    // }
    //
    // return this.serverEntityManager.getEntities();
  }

  private canvasClickHandler = (event: MouseEvent): void => {
    const zoom = this.camera.zoom;
    this.serverEntityManager.getEntities().forEach((entity) => {
      const { x: mouseX, y: mouseY } =
        this.canvasRelatedMouseCoordinatesBehaviourSubject.getValue();

      const entityWidth = entity.gameObject.width;
      const entityHeight = entity.gameObject.height;

      const isEntityHovered = isIntersect(
        {
          x1: entity.position[0] * zoom,
          x2: (entity.position[0] + entityWidth) * zoom,
          y1: entity.position[1] * zoom,
          y2: (entity.position[1] + entityHeight) * zoom,
        },
        {
          x1: mouseX,
          x2: mouseX,
          y1: mouseY,
          y2: mouseY,
        },
      );

      if (isEntityHovered) {
        if (this.selectedEntityBehaviourSubject.getValue() === entity) {
          this.selectedEntityBehaviourSubject.setValue(null);
        } else {
          this.selectedEntityBehaviourSubject.setValue(entity);
        }
      }

      return;
    });
  };

  private mousemoveHandler = (event: MouseEvent): void => {
    this.mouseBehaviourSubject.setValue({
      x: event.clientX,
      y: event.clientY,
    });
  };

  private keydownHandler = (event: KeyboardEvent): void => {
    if (event.code === "Escape") {
      this.selectedEntityBehaviourSubject.setValue(null);
    }
  };

  public reset(): void {
    this.destructor();
    this.setUp();
    this.start();
  }

  protected setUp(): void {
    super.setUp();

    this.camera.zoom = 1;
    this.canvas.scrollIntoView();
    // this.canvas.width = window.innerWidth * 0.8;
    // this.canvas.height = window.innerHeight * 0.8;

    window.addEventListener("mousemove", this.mousemoveHandler);
    window.addEventListener("keydown", this.keydownHandler);
    this.canvas.addEventListener("click", this.canvasClickHandler);

    for (let i = 0; i < 4; i++) {
      const entity = new BaseEntity(this.serverEntityManager, i + 1);
      entity.speedPixInSecond = 10 * i;
      entity.position = [300, 100 * i + 20 * (i + 1) + 200];
      if (i === 3) {
        entity.name = "Slime";
        entity.gameObject = new SpriteGameObject(
          "slime",
          100,
          100,
          ["move", 0],
          0.5,
          AssetManager,
        );
      } else {
        entity.name = "Yellow square";
        entity.gameObject = new SimpleGameObject("rgb(192,185,59)", 100, 100);
      }

      this.serverEntityManager.addEntity(entity);
    }
  }

  public getServerEntityManager() {
    return this.serverEntityManager;
  }

  protected initRenderer(): IRenderer {
    return new (class extends DefaultCanvasRenderer {
      public constructor(
        canvas: HTMLCanvasElement,
        private sceneRunner: EditorSceneRunner,
      ) {
        super(canvas);
      }

      public render(scene: IClientScene) {
        super.render(scene);
        const zoom = scene.camera.zoom;
        for (const entity of scene.getEntities()) {
          const { x: mouseX, y: mouseY } =
            this.sceneRunner.canvasRelatedMouseCoordinatesBehaviourSubject.getValue();

          const entityWidth = entity.gameObject.width;
          const entityHeight = entity.gameObject.height;

          const isEntityHovered = isIntersect(
            {
              x1: entity.position[0] * zoom,
              x2: (entity.position[0] + entityWidth) * zoom,
              y1: entity.position[1] * zoom * zoom,
              y2: (entity.position[1] + entityHeight) * zoom,
            },
            {
              x1: mouseX,
              x2: mouseX,
              y1: mouseY,
              y2: mouseY,
            },
          );

          const strokeWidth = 1 * zoom;
          const strokeOffset = 5 * zoom;

          if (
            this.sceneRunner.selectedEntityBehaviourSubject.getValue() ===
            entity
          ) {
            this.context2d.save();
            // this.context2d.strokeStyle = "red";
            this.context2d.strokeStyle = "rgb(0,255,4)";

            this.context2d.lineWidth = strokeWidth;
            this.context2d.strokeRect(
              (entity.position[0] - strokeOffset - strokeWidth / 2) * zoom,
              (entity.position[1] - strokeOffset - strokeWidth / 2) * zoom,
              (entityWidth + strokeWidth + strokeOffset * 2) * zoom,
              (entityHeight + strokeWidth + strokeOffset * 2) * zoom,
            );
            this.context2d.restore();
          } else if (isEntityHovered) {
            this.context2d.save();
            // this.context2d.strokeStyle = "red";
            this.context2d.strokeStyle = "rgb(148,148,148)";

            this.context2d.lineWidth = strokeWidth;
            this.context2d.strokeRect(
              (entity.position[0] - strokeOffset - strokeWidth / 2) * zoom,
              (entity.position[1] - strokeOffset - strokeWidth / 2) * zoom,
              (entityWidth + strokeOffset * 2 + strokeWidth) * zoom,
              (entityHeight + strokeOffset * 2 + strokeWidth) * zoom,
            );
            this.context2d.restore();
          }
        }
      }

      protected renderEntity(entity: IEntity, camera: ICamera): void {
        super.renderEntity(entity, camera);
      }
    })(this.canvas, this);
  }

  public destructor(): void {
    super.destructor();

    window.removeEventListener("mousemove", this.mousemoveHandler);

    if (this.canvas) {
      this.canvas.removeEventListener("click", this.canvasClickHandler);
    }
  }
}

export const Editor: React.FC = () => {
  const [windowManager] = useState(() => new WindowManager());
  const sceneRunner = useMemo(() => {
    return new EditorSceneRunner(windowManager);
  }, []);

  useEffect(() => {
    sceneRunner.pause();

    // const controller = new DefaultWindowController();
    // controller.send("setTopLeft", { top: 350, left: 300 });
    //
    // const win = windowManager.addWindow(controller);
    //
    // controller.title.setValue("test window");
    // win.controller.on("mount", () => {});

    return () => {
      sceneRunner.destructor();
      // windowManager.closeWindow(win.id);
    };
  }, [sceneRunner]);

  const selectedEntity = useBehaviourSubject(
    sceneRunner.selectedEntityBehaviourSubject,
  );

  // useShortPooling(1, 100, () => Math.random());

  useBehaviourSubject((selectedEntity as BaseEntity) || null);

  const windows = useBehaviourSubject(windowManager.windowsList);

  const settingsWindowIsOpenRef = useRef(false);

  const openSettings = (): void => {
    if (settingsWindowIsOpenRef.current) return;
    settingsWindowIsOpenRef.current = true;

    const settingsWindowController = new DefaultWindowController();

    const SettingsWindowBody: React.FC = () => {
      const [selectedItem, setSelectedItem] = useState("Keymap");
      const keymap = useBehaviourSubject(keymapSubject);

      return (
        <>
          <div
            className="flex justify-start items-start gap-2"
            style={{
              minHeight: 400,
              overflow: "hidden",
              maxHeight: "100%",
            }}
          >
            <div
              className="flex flex-col justify-start items-stretch gap-1"
              style={{ width: 135, overflow: "scroll" }}
            >
              {["Keymap", "Appearance"].map((x) => {
                return (
                  <p
                    key={x}
                    tabIndex={0}
                    role="button"
                    className={`${selectedItem === x ? "bg-primary" : ""} focus:outline-0 border-2 border-transparent focus:border-blue-600 hover:bg-primary rounded-md flex justify-start items-center cursor-default`}
                    style={{ padding: "0 10px", height: 20 }}
                    onClick={() => setSelectedItem(x)}
                    onKeyDown={(event) =>
                      event.code === "Space" ? setSelectedItem(x) : null
                    }
                  >
                    {x}
                  </p>
                );
              })}
            </div>
            <div style={{ height: 530, flex: 1 }}>
              <UIPanel
                style={{
                  width: "100%",
                  minHeight: "100%",
                  maxHeight: "100%",
                  overflow: "scroll",
                  background: null,
                  backdropFilter: null,
                  padding: 10,
                }}
              >
                {selectedItem === "Keymap" && (
                  <>
                    <p className="text-lg">Keymap</p>
                    <div style={{ height: 0 }}></div>
                    {(() => {
                      const arrayToReturn = [];
                      for (const key in keymap) {
                        arrayToReturn.push(
                          <div
                            key={key}
                            className="flex justify-between items-center"
                            style={{
                              borderTop: "1px solid rgba(72,72,72,0.8)",
                              paddingTop: 10,
                              marginTop: 10,
                              marginBottom: 15,
                            }}
                          >
                            <div>
                              <div className="text-sm mb-1">{key}</div>
                              <div className="text-xs">
                                {keymap[key].description}
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-start items-center gap-2">
                                <p>Control key</p>
                                <Switch
                                  value={keymap[key].keys[0].ctrlKey}
                                  onChange={(checked) => {
                                    bsProduce(keymapSubject, (draft) => {
                                      draft[key].keys[0].ctrlKey = checked;
                                    });
                                  }}
                                ></Switch>
                              </div>
                              <div className="mt-1">
                                <KeyRecorder
                                  value={keymap[key].keys[0].code}
                                  onChange={(value) => {
                                    bsProduce(keymapSubject, (draft) => {
                                      draft[key].keys[0].code = value;
                                    });
                                  }}
                                ></KeyRecorder>
                              </div>
                            </div>
                          </div>,
                        );
                      }
                      return arrayToReturn;
                    })()}
                  </>
                )}
              </UIPanel>
            </div>
          </div>
        </>
      );
    };
    settingsWindowController.renderBody.setValue(() => {
      return <SettingsWindowBody />;
    });
    settingsWindowController.send("setTopLeft", {
      top: 300,
      left: 300,
    });

    settingsWindowController.on("mount", () => {
      console.log("Settings window is open");
    });

    settingsWindowController.resizableSubject.setValue(false);
    settingsWindowController.title.setValue("Settings");
    settingsWindowController.on("exit", () => {
      settingsWindowIsOpenRef.current = false;
    });

    WindowManager.centerWindow(settingsWindowController);
    windowManager.addWindow(settingsWindowController);
  };

  const openHelpWindow = (): void => {
    const controller = new DefaultWindowController();
    controller.title.setValue("Help");
    controller.renderBody.setValue(() => <p>Help window</p>);
    controller.topLeft.setValue({ top: 100, left: 100 });
    WindowManager.centerWindow(controller);
    windowManager.addWindow(controller);
  };

  const closeAllWindows = () => {
    for (const win of windowManager.windowsList.getValue()) {
      windowManager.closeWindow(win.id);
    }
  };

  const openWindowManager = () => {
    const controller = new DefaultWindowController();
    controller.title.setValue("Window manager");

    const RenderWindowListItem = ({
      win,
      selected,
      setSelected,
    }: {
      win: IWindow;
      selected: boolean;
      setSelected: () => void;
    }) => {
      const title = useBehaviourSubject(win.controller.title);

      return (
        <p
          tabIndex={0}
          role="button"
          className={`${selected ? "bg-primary" : ""} focus:outline-0 border-2 border-transparent focus:border-blue-600 hover:bg-primary rounded-md flex justify-start items-center cursor-default`}
          style={{ padding: "0 10px", height: 20 }}
          onClick={setSelected}
          onKeyDown={(event) => (event.code === "Space" ? setSelected : null)}
        >
          {title}
        </p>
      );
    };

    const RenderWindowDetail = ({ id }: { id: number }) => {
      const win: IWindow = useBehaviourSubject(
        windowManager.windows,
        (windows) => windows[id],
      );
      const title = useBehaviourSubject(win.controller.title);

      return (
        <>
          <p className="text-lg">{title}</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 rounded-md active:bg-blue-800 pt-1 pb-1 pl-2 pr-2"
            onClick={() => {
              WindowManager.centerWindow(win.controller);
            }}
          >
            Move to center
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 rounded-md active:bg-red-700 pt-1 pb-1 pl-2 pr-2"
            onClick={() => windowManager.closeWindow(win.id)}
          >
            Close window
          </button>
        </>
      );
    };

    const WindowManagerBody = () => {
      const [selectedId, setSelectedId] = useState<number | null>(null);
      const windows = useBehaviourSubject(windowManager.windowsList);

      return (
        <div
          className="grid gap-3"
          style={{ height: "100%", gridTemplateColumns: "1fr 4fr" }}
        >
          <div
            className="flex flex-col justify-start items-stretch gap-1"
            style={{ width: 135 }}
          >
            <p className="text-md pl-3 text-gray-400">
              Windows (<span className="font-mono">{windows.length}</span>){" "}
              <button
                className="text-gray-300 hover:text-white active:text-gray-500 text-xs"
                onClick={closeAllWindows}
              >
                close all
              </button>
            </p>
            {windows.map((win) => {
              return (
                <RenderWindowListItem
                  key={win.id}
                  win={win}
                  selected={selectedId === win.id}
                  setSelected={() => setSelectedId(win.id)}
                />
              );
            })}
          </div>
          <div style={{ height: "100%" }}>
            <UIPanel
              style={{
                width: "100%",
                height: "100%",
                background: null,
                backdropFilter: null,
                padding: 10,
              }}
            >
              {selectedId && windowManager.windows.getValue()[selectedId] && (
                <RenderWindowDetail id={selectedId} />
              )}
            </UIPanel>
          </div>
        </div>
      );
    };
    controller.renderBody.setValue(() => {
      return <WindowManagerBody />;
    });
    controller.topLeft.setValue({ top: 100, left: 100 });
    windowManager.addWindow(controller);
  };

  const openEntitiesList = (): void => {
    const controller = new EntitiesListController(sceneRunner);
    controller.topLeft.setValue({ top: 30, left: 0 });
    windowManager.addWindow(controller);
  };

  const openSceneControls = (): void => {
    const controller = new SceneControlsController(sceneRunner);
    controller.topLeft.setValue({ top: 30, left: 160 });
    windowManager.addWindow(controller);
  };

  const openLibrary = (): void => {
    const controller = new LibraryController(sceneRunner);
    controller.topLeft.setValue({
      top: window.innerHeight - controller.widthHeight.getValue().height,
      left: 0,
    });
    windowManager.addWindow(controller);
  };

  const menuConfig: IMenuConfig = useMemo(() => {
    return {
      items: [
        {
          title: "File",
          items: [
            { title: "New project" },
            { title: "Open project" },
            { title: "Save project" },
            {
              title: "Settings",
              onClick: openSettings,
            },
          ],
        },
        {
          title: "Edit",
        },
        {
          title: "View",
        },
        {
          title: "Window",
          items: [
            {
              title: "Window manager",
              onClick: openWindowManager,
            },
            {
              title: "Scene controls",
              onClick: openSceneControls,
            },
            {
              title: "Entities list",
              onClick: openEntitiesList,
            },
            {
              title: "Library",
              onClick: openLibrary,
            },
            {
              title: "Close all windows",
              onClick: closeAllWindows,
            },
          ],
        },
        {
          title: "Help",
          onClick: openHelpWindow,
        },
      ],
    };
  }, []);

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent): void => {
      if (event.repeat) {
        return;
      }
      if (event.code === "ControlLeft") {
        return;
      }

      const keymap = keymapSubject.getValue();
      for (const keymapKey in keymap) {
        const item = keymap[keymapKey];
        for (const keybind of item.keys) {
          if (
            event.ctrlKey === keybind.ctrlKey &&
            keybind.code === event.code
          ) {
            if (keymapKey === "Settings") {
              openSettings();
            } else if (keymapKey === "Help") {
              openHelpWindow();
            } else if (keymapKey === "Close Window") {
              windowManager.closeWindow(
                windowManager.focusedWindowId.getValue(),
              );
            } else if (keymapKey === "Window Manager") {
              openWindowManager();
            } else if (keymapKey === "Entities list") {
              openEntitiesList();
            } else if (keymapKey === "Scene controls") {
              openSceneControls();
            } else if (keymapKey === "Library") {
              openLibrary();
            }
          }
        }
      }
    };

    openEntitiesList();
    openSceneControls();
    openLibrary();

    window.addEventListener("keydown", keyDownHandler);
    return () => {
      closeAllWindows();
      window.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  return (
    <>
      <Menu config={menuConfig} />
      <div
        className="bg-gray-400"
        style={{
          width: "100dvw",
          height: "100dvh",
          overflow: "scroll",
        }}
      >
        <div
          className="flex justify-center items-center"
          style={{
            width: "200dvw",
            height: "200dvh",
          }}
        >
          <div
            className="flex justify-center items-center "
            style={{
              width: "100dvw",
              height: "100dvh",
            }}
          >
            <SceneRenderer sceneRunner={sceneRunner} />
          </div>
        </div>
      </div>
      <RenderWindows windows={windows} windowManager={windowManager} />
      {selectedEntity && (
        <UIPanel
          style={{
            position: "fixed",
            top: 35,
            right: 10,
            width: 200,
            height: 600,
          }}
        >
          <div className="p-2">
            <h1>Selected Entity:</h1>
            <div>id: {selectedEntity.id}</div>
            <div>name: {selectedEntity.name}</div>
            <div>
              speedPixInSecond:{" "}
              <input
                key={selectedEntity.id}
                type="number"
                defaultValue={selectedEntity.speedPixInSecond}
                className="text-black"
                onChange={(event) => {
                  selectedEntity.speedPixInSecond = parseInt(
                    event.target.value || "0",
                  );
                }}
              />
            </div>
            <div>speedPixInSecond: {selectedEntity.rotationInRadian}</div>
            <div>
              position:{" "}
              {JSON.stringify(selectedEntity.position || [null, null])}
            </div>
            <div>
              <div>controller: </div>
              <select
                id="controllerSelectId"
                className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onChange={(event) => {
                  selectedEntity.controller.destructor();

                  const controllerFactory = new ControllerFactory();

                  selectedEntity.controller =
                    controllerFactory.createControllerByType(
                      event.target.value,
                      sceneRunner.getCanvas(),
                      selectedEntity,
                    );
                }}
              >
                <option value="NullController">NullController</option>
                <option value="TestKeyboardController">
                  TestKeyboardController
                </option>
                <option value="TestFollowMouseController">
                  TestFollowMouseController
                </option>
              </select>
              <select
                style={{ display: "none" }}
                name="controller"
                id="controllerSelectId"
                onChange={(event) => {
                  selectedEntity.controller.destructor();

                  const controllerFactory = new ControllerFactory();

                  selectedEntity.controller =
                    controllerFactory.createControllerByType(
                      event.target.value,
                      sceneRunner.getCanvas(),
                      selectedEntity,
                    );
                }}
              >
                <option value="NullController">NullController</option>
                <option value="TestKeyboardController">
                  TestKeyboardController
                </option>
                <option value="TestFollowMouseController">
                  TestFollowMouseController
                </option>
              </select>
            </div>
          </div>
        </UIPanel>
      )}
    </>
  );
};

interface IMenuItem {
  title: string;
  onClick?: () => void;
  items?: IMenuItem[];
}

interface IMenuConfig {
  items: IMenuItem[];
}

const TopLevelMenuItem: React.FC<{ item: IMenuItem }> = ({ item }) => {
  const { isHovered, onMouseEnter, onMouseLeave } = useHover();

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ height: 20 }}
      className="flex justify-center items-center rounded-md pl-1 pr-1 hover:bg-primary cursor-default relative"
    >
      <span className="" onClick={item.onClick} tabIndex={0} role="button">
        {item.title}
      </span>
      {isHovered && item.items && (
        <div
          className="absolute rounded-xl text-xs"
          style={{
            left: "calc(-12px)",
            top: "calc(100%)",
            zIndex: 1,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(72,72,72,0.8)",
            width: 200,
            // height: 300,
            padding: "5px",
          }}
        >
          {item.items.map((it) => (
            <div
              key={it.title}
              tabIndex={0}
              role="button"
              onClick={it.onClick}
              className="hover:bg-primary rounded-md flex justify-start items-center"
              style={{ padding: "0 10px", height: 20 }}
            >
              <span>{it.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Menu: React.FC<{ config: IMenuConfig }> = ({ config }) => {
  return (
    <div
      className="fixed top-0 left-0 flex justify-start items-center pl-3 text-white text-xs "
      style={{
        height: 25,
        zIndex: 1,
        width: "100%",
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(72,72,72,0.8)",
      }}
    >
      {config.items.map((item) => (
        <TopLevelMenuItem key={item.title} item={item} />
      ))}
    </div>
  );
};

const RenderWindows: React.FC<{
  windows: IWindow[];
  windowManager: WindowManager;
}> = React.memo(({ windows, windowManager }) => {
  return (
    <>
      {windows.map(({ controller, id }) => {
        return React.createElement(controller.View, {
          key: id,
          id: id,
          controller: controller,
          windowManager: windowManager,
        });
      })}
    </>
  );
});
RenderWindows.displayName = "RenderWindows";
