import React, { useEffect, useRef } from "react";
import { IWindowController } from "./WindowManager";
import { Window } from "../ui-components/ui-components";
import { BehaviourSubject } from "../../../shared/behaviour-subject/BehaviourSubject";
import { useBehaviourSubject } from "../../bin/start-client";
import { EventEmitter } from "../../../shared/event-emitter/EventEmitter";

export class DefaultWindowController implements IWindowController {
  // @ts-ignore
  public listeners = {} as any;
  public title = new BehaviourSubject("");
  public renderBody = new BehaviourSubject(() => null);
  public topLeft = new BehaviourSubject({ top: 0, left: 0 });
  public widthHeight = new BehaviourSubject({ width: 800, height: 600 });
  public resizableSubject = new BehaviourSubject(true);

  private eventEmitter = new EventEmitter();
  private animationNameSubject = new BehaviourSubject("loadEvent");

  public constructor() {
    this.View.displayName = "DefaultWindowController.View";
  }

  on(command: string, handler: (data: any) => void): () => void {
    if (!this.listeners[command]) {
      this.listeners[command] = [];
    }

    this.listeners[command].push(handler);

    return () => {
      this.listeners[command] = this.listeners[command].filter(
        (l) => l !== handler,
      );
    };
  }

  async send(command: string, data: any): Promise<void> {
    if (command === "setTopLeft") {
      this.topLeft.setValue(data);
    }

    if (command === "mount") {
      this.listeners["mount"]?.forEach((h) => {
        h();
      });
    }

    if (command === "exit") {
      this.animationNameSubject.setValue("loadEventReverse");
      return new Promise((resolve) => {
        const unsubscribe = this.eventEmitter.subscribe(
          "loadeventReverse ended",
          () => {
            console.log("here");
            this.listeners["exit"]?.forEach((h) => {
              h();
            });

            resolve();
            unsubscribe();
          },
        );
      });
    }
  }

  // @ts-ignore
  View = React.memo(({ controller, id, windowManager }) => {
    const windowRef = useRef();
    const title = useBehaviourSubject(this.title);

    useEffect(() => {
      const unsubscribeFromSetTopLeft = controller.on(
        "setTopLeft",
        (newTopLeft) => {
          this.topLeft.setValue(newTopLeft);
        },
      );
      const unsubscribeFromSetWidthHeight = controller.on(
        "setWidthHeight",
        (newWidthHeight) => {
          this.widthHeight.setValue(newWidthHeight);
        },
      );

      const unsubscribeFromSetTopLeftSubject = this.topLeft.subscribe(
        (newTopLeft) => {
          windowRef.current.setTopLeft(newTopLeft);
        },
      );
      const unsubscribeFromWidthHeightSubject = this.widthHeight.subscribe(
        (newWidthHeight) => {
          windowRef.current.setWidthHeight(newWidthHeight);
        },
      );

      controller.send("mount", null);

      return () => {
        unsubscribeFromSetTopLeft();
        unsubscribeFromSetWidthHeight();
        unsubscribeFromSetTopLeftSubject();
        unsubscribeFromWidthHeightSubject();
      };
    }, []);

    const topLeft = useBehaviourSubject(this.topLeft);
    const focused = useBehaviourSubject(
      windowManager.focusedWindowId,
      (focusedId) => focusedId === id,
    );

    const animationName = useBehaviourSubject(this.animationNameSubject);
    const resizable = useBehaviourSubject(this.resizableSubject);
    const widthHeight = useBehaviourSubject(this.widthHeight);

    // @ts-ignore
    return (
      <Window
        title={title}
        ref={windowRef}
        onClose={() => {
          windowManager.closeWindow(id);
        }}
        onClick={() => {
          // windowManager.focusedWindowId.setValue(id);
        }}
        onMouseDown={() => {
          windowManager.focusedWindowId.setValue(id);
        }}
        onClickOutside={
          focused
            ? () => {
                windowManager.focusedWindowId.setValue(null);
              }
            : undefined
        }
        onAnimationEnd={(event: React.AnimationEvent<HTMLDivElement>) => {
          if (event.animationName === "loadeventReverse") {
            this.eventEmitter.emit("loadeventReverse ended", null);
          }
        }}
        top={topLeft.top}
        left={topLeft.left}
        focused={focused}
        className={animationName}
        resizable={resizable}
        width={widthHeight.width}
        height={widthHeight.height}
      >
        {this.renderBody.getValue()()}
      </Window>
    );
  });
}
