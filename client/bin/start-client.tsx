import React, { memo, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { createMachine } from "xstate";
import { useMachine } from "@xstate/react";
// @ts-expect-error todo config import static
import wrenchSvg from "./wrench.svg";
// @ts-expect-error todo config import static
import gamepadSvg from "./gamepad.svg";
import { BaseEntity } from "../../shared/entity/BaseEntity";
import { SimpleGameObject } from "../../shared/game-object/SimpleGameObject";
import { DefaultOfflineCanvasSceneRunner } from "../scene/DefaultOfflineCanvasSceneRunner";
import { TestFollowMouseController } from "../controller/TestFollowMouseController";
import { TestKeyboardController } from "../controller/TestKeyboardController";
import { DefaultOnlineCanvasSceneRunner } from "../scene/DefaultOnlineCanvasSceneRunner";
import { Socket } from "socket.io-client";
import { KeyboardTMP } from "../controller/KeyboardTMP";
import { AssetManager } from "../../shared/asset-manager/AssetManager";
import { BehaviourSubject } from "../../shared/behaviour-subject/BehaviourSubject";
import { IEntity } from "../../shared/entity/IEntity";
import { Editor } from "../editor/Editor";
import { Helmet } from "react-helmet";
import { Spinner } from "../editor/ui-components/Spinner";

// State machine
const uiMachine = createMachine({
  id: "ui",
  initial: "loading",
  context: {},
  states: {
    loading: {
      on: {
        menu: "menu",
        assets_loading_error: "assets_loading_error",
        editor: "editor",
        after_load_assets: "menu",
      },
    },
    assets_loading_error: {},
    menu: {
      on: {
        local_scenario: { target: "local_scenario" },
        join_with_link: { target: "join_with_link" },
        join_official_server: { target: "join_official_server" },
        editor: { target: "editor" },
      },
    },
    join_official_server: {
      on: {
        menu: { target: "menu" },
      },
    },
    join_with_link: {
      on: {
        menu: { target: "menu" },
      },
    },
    local_scenario: {
      on: {
        menu: { target: "menu" },
      },
    },
    editor: {
      on: {
        menu: { target: "menu" },
      },
    },
  },
});

export const useBehaviourSubject = <T, G = T>(
  bs: BehaviourSubject<T> | null,
  selector = (x): G => x,
): G => {
  const [value, setValue] = useState(selector(bs && bs.getValue()));

  useEffect(() => {
    const handler = (): void => {
      if (!bs) {
        return;
      }

      const selectedValue = selector(bs.getValue());

      if (selectedValue !== value) {
        setValue(selectedValue);
      }
    };

    handler();
    const unsubscribe = bs && bs.subscribe(handler);

    return () => {
      unsubscribe?.();
    };
  }, [bs, selector, value]);

  return value;
};

const entitiesBS = new BehaviourSubject<IEntity[]>([]);
const serverEntitiesBS = new BehaviourSubject<IEntity[]>([]);

const Example1 = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectCounter = useRef(0);

  useEffect(() => {
    effectCounter.current++;
    if (effectCounter.current !== 1) return;

    class MyEntity extends BaseEntity {
      public constructor(
        color: string = "green",
        width: number = 100,
        height: number = 100,
        // speed = 0,
      ) {
        // todo fixme
        super(null, 0);
        this.gameObject = new SimpleGameObject(color, width, height);
      }
    }

    class DemoCanvasSceneRunner extends DefaultOfflineCanvasSceneRunner {
      private interval: any;
      public constructor() {
        super();
      }

      protected setUp(): void {
        super.setUp();

        // this.serverEntityManager.addEntity(new RedSquareEntity());
        const redSquareEntity = new MyEntity("red", 100, 100);
        redSquareEntity.controller = new TestFollowMouseController(
          canvas,
          redSquareEntity,
        );
        this.serverEntityManager.addEntity(redSquareEntity);

        const greenSquareEntity = new MyEntity("green", 100, 100);
        greenSquareEntity.controller = new TestKeyboardController(
          greenSquareEntity,
        );
        this.serverEntityManager.addEntity(greenSquareEntity);
        this.interval = setInterval(() => {
          entitiesBS.setValue(this.serverEntityManager.getEntities());
        }, 50);
      }

      public destructor(): void {
        super.destructor();
        clearInterval(this.interval);
      }
    }

    const canvas = canvasRef.current;
    const demoCanvasSceneRunner = new DemoCanvasSceneRunner();
    demoCanvasSceneRunner.setCanvas(canvas);

    demoCanvasSceneRunner.start();
  }, []);

  return (
    <>
      <canvas ref={canvasRef} />
    </>
  );
});

const ExampleOnline: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectCounter = useRef(0);

  useEffect(() => {
    effectCounter.current++;
    if (effectCounter.current !== 1) return;

    const demoCanvasSceneRunner = new DefaultOnlineCanvasSceneRunner(
      "http://localhost:3000/",
    );
    demoCanvasSceneRunner.setCanvas(canvasRef.current);
    demoCanvasSceneRunner.setUp();

    const socket = (demoCanvasSceneRunner.clientTransfer as any)
      .socket as Socket;
    socket.on("debug:server_entities", (entities) => {
      serverEntitiesBS.setValue(entities);
    });

    const interval = setInterval(() => {
      entitiesBS.setValue([
        ...(demoCanvasSceneRunner as any).clientEntityManager.getEntities(),
      ]);
    }, 50);

    const keyboardTmp = new KeyboardTMP();

    keyboardTmp.subscribe((keys) => {
      /* eslint-disable-next-line */ // TODO
      ((demoCanvasSceneRunner.clientTransfer as any).socket as Socket).send(
        "keys",
        keys,
      );
    });

    demoCanvasSceneRunner.start();
    return () => {
      clearInterval(interval);
    };
  }, []);

  const entities: IEntity[] = useBehaviourSubject(entitiesBS);
  const serverEntities: IEntity[] = useBehaviourSubject(serverEntitiesBS);

  return (
    <>
      <canvas ref={canvasRef} />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 200,
          minHeight: 500,
          background: "black",
        }}
      >
        {serverEntities.map((entity) => {
          return (
            <pre
              style={{ color: "lime", fontFamily: "monospace", fontSize: 9 }}
              key={entity.id}
            >
              {JSON.stringify(entity, null, 4)}
            </pre>
          );
        })}
      </div>
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 200,
          width: 200,
          minHeight: 500,
          background: "#002a8f",
        }}
      >
        {entities.map((entity) => {
          return (
            <pre
              style={{ color: "lime", fontFamily: "monospace", fontSize: 9 }}
              key={entity.id}
            >
              {JSON.stringify(entity, null, 4)}
            </pre>
          );
        })}
      </div>
    </>
  );
});
ExampleOnline.displayName = "ExampleOnline";

const Button: React.FC<
  React.ButtonHTMLAttributes<unknown> & {
    children?: React.ReactNode;
    color?: string;
  }
> = (params) => {
  return (
    <button
      {...params}
      className={
        "rounded-md p-2 uppercase text-white " + (params.className || "")
      }
    />
  );
};

const ButtonLink: React.FC<
  React.ButtonHTMLAttributes<unknown> & {
    children?: React.ReactNode;
    color?: string;
  }
> = (params) => {
  return (
    <button
      {...params}
      className={"rounded-md p-2 uppercase " + (params.className || "")}
    />
  );
};

const ButtonBlack: React.FC<
  React.ButtonHTMLAttributes<unknown> & {
    children?: React.ReactNode;
    color?: string;
  }
> = (params) => {
  return (
    <Button
      {...params}
      className={
        "rounded-md p-2 uppercase active:bg-gray-700 bg-gray-900 hover:bg-gray-800 text-white " +
        (params.className || "")
      }
    />
  );
};

const ButtonGreen: React.FC<
  React.ButtonHTMLAttributes<unknown> & {
    children: React.ReactNode;
    color?: string;
  }
> = (params) => {
  return (
    <Button
      {...params}
      className={
        "rounded-md p-2 uppercase bg-green-500 hover:bg-green-600 active:bg-green-700 text-white " +
        (params.className || "")
      }
    />
  );
};

const ButtonOrange: React.FC<
  React.ButtonHTMLAttributes<unknown> & {
    children: React.ReactNode;
    color?: string;
  }
> = (params) => {
  return (
    <Button
      {...params}
      className={
        "rounded-md p-2 uppercase bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white " +
        (params.className || "")
      }
    />
  );
};

const NavButton: React.FC<
  React.ButtonHTMLAttributes<unknown> & { children?: React.ReactNode }
> = (params) => {
  return (
    <button
      {...params}
      className={
        (params.className || "") +
        " " +
        "p-1 text-xs sm:text-sm text-gray-600 hover:text-orange-500 active:text-gray-400"
      }
    />
  );
};

const Input: React.FC<
  React.InputHTMLAttributes<unknown> & { children?: React.ReactNode }
> = (params) => {
  return (
    <input
      {...params}
      className={
        (params.className || "") +
        " " +
        "rounded-md p-2 border-gray-400 focus:border-orange-400 outline-0 border-1 hover:bg-gray-100 focus:bg-gray-100"
      }
    />
  );
};

const headerHeight = 50;
const Menu: React.FC<{ children?: React.ReactNode }> = () => {
  const [current, send] = useMachine(uiMachine);

  const showHeader = !["join_with_link", "editor", "local_scenario"].some((x) =>
    current.matches(x),
  );

  useEffect(() => {
    AssetManager.loadAllAssets()
      .then(() => {
        send({ type: "after_load_assets" });
        // send({ type: "editor" });
      })
      .catch(() => {
        send({ type: "assets_loading_error" });
      });
  }, []);

  return (
    <>
      {showHeader && (
        <>
          <Helmet>
            <title>JavaScript MMORPG engine and editor</title>
          </Helmet>
          <div
            style={{ height: headerHeight, borderBottomWidth: "1px" }}
            className="w-full bg-gray-100 grid grid-cols-2 text-gray-700 sticky top-0 left-0 z-10 border-gray-200"
          >
            <div className="pl-5 flex items-center gap-4">
              <p className="text-xs sm:text-sm">
                <span className="text-yellow-600">JavaScript</span>{" "}
                <span>2D MMORPG-engine and scenario editor</span>
              </p>
            </div>
            <div className="pr-5 flex justify-end items-center gap-3">
              <NavButton>Donate</NavButton>
              <NavButton>Documentation</NavButton>
              <NavButton>About</NavButton>
              <NavButton>
                <a href="https://github.com/nulnow/javascript-mmorpg-engine">
                  GitHub
                </a>
              </NavButton>
            </div>
          </div>
        </>
      )}
      {(() => {
        switch (true) {
          case current.matches("loading"): {
            return <Spinner />;
          }
          case current.matches("assets_loading_error"): {
            return "assets_loading_error";
          }
          case current.matches("menu"): {
            return (
              <>
                <div
                  style={{
                    height: `calc(100dvh - ${showHeader ? headerHeight : 0}px)`,
                  }}
                  className="grid xs:grid-cols-2 md:grid-cols-2"
                >
                  <div className=" xs:h-1/2 flex justify-center items-center bg-gray-200">
                    {/*<div*/}
                    {/*  className="absolute"*/}
                    {/*  style={{*/}
                    {/*    top: "50%",*/}
                    {/*    left: "50%",*/}
                    {/*    transform: "translate(-50%, -50%)",*/}
                    {/*  }}*/}
                    {/*>*/}
                    {/*  DEVELOPMENT*/}
                    {/*</div>*/}
                    <div className="grid grid-cols-1 w-3/4 md:w-1/2 max-w-xs gap-4">
                      <div className="flex justify-center mb-0 pointer-events-none select-none">
                        <img
                          className="opacity-50 w-1/3 sm:w-1/2"
                          src={gamepadSvg}
                          alt="gamepad"
                        />
                      </div>
                      <p className="text-gray-700 text-xl text-center">
                        Login to official server
                      </p>
                      <Input
                        placeholder="login"
                        className=""
                        style={{ borderWidth: 1 }}
                        type="text"
                        disabled
                      />
                      <Input
                        placeholder="password"
                        className=""
                        style={{ borderWidth: 1 }}
                        type="password"
                        disabled
                      />
                      <ButtonBlack className="" disabled>
                        Login
                      </ButtonBlack>
                      <hr className="border-gray-400 mb-0" />
                      <ButtonLink
                        disabled
                        className="text-gray-900 hover:text-gray-700 active:text-gray-600 p-0 -mt-3"
                      >
                        register
                      </ButtonLink>
                    </div>
                  </div>
                  <div className=" xs:h-1/2 flex justify-center items-center bg-gray-300">
                    <div className=" grid grid-cols-1 w-3/4 md:w-1/2 max-w-md gap-4">
                      <div className="flex justify-center mb-10 pointer-events-none select-none">
                        <img
                          className="opacity-50 w-1/3 sm:w-1/3"
                          src={wrenchSvg}
                          alt="wrench"
                        />
                      </div>
                      <ButtonBlack
                        className="w-full"
                        onClick={() => send({ type: "local_scenario" })}
                      >
                        run a local scenario
                      </ButtonBlack>
                      <ButtonBlack
                        className="w-full"
                        onClick={() => send({ type: "join_with_link" })}
                      >
                        join server by a link
                      </ButtonBlack>
                      <ButtonOrange
                        className="w-full border-0"
                        onClick={() => send({ type: "editor" })}
                      >
                        editor
                      </ButtonOrange>
                      <hr className="border-gray-400 mb-0" />
                      <ButtonLink className="text-gray-900 hover:text-gray-700 active:text-gray-600 p-0 -mt-3">
                        guide
                      </ButtonLink>
                    </div>
                  </div>
                </div>
                <div
                  style={{ minHeight: "100dvh" }}
                  className="p-10 bg-gray-100"
                >
                  <div
                    style={{ maxWidth: 800, width: "100%", margin: "0 auto" }}
                  >
                    <h1 className="text-5xl font-bold mb-6 text-gray-800">
                      Guide
                    </h1>
                    <p className="text-l font-medium text-gray-700">
                      This is a platform that allows users to create their own
                      JavaScript 2d games
                    </p>
                  </div>
                </div>
              </>
            );
          }
          case current.matches("join_with_link"): {
            return <ExampleOnline />;
          }
          case current.matches("local_scenario"): {
            return <Example1 />;
          }
          case current.matches("editor"): {
            return (
              <>
                <Helmet>
                  <title>️Editor</title>
                </Helmet>
                <Editor />
              </>
            );
          }
          default: {
            return (
              <div>
                <h1>UNKNOWN STATE {current.value}</h1>
                <button onClick={() => send({ type: "menu" })}>back</button>
              </div>
            );
          }
        }
      })()}
    </>
  );
};

const rootElem = document.getElementById("root");
const root = createRoot(rootElem);
root.render(<Menu />);
