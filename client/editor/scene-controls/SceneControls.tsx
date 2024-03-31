import React from "react";
import { DefaultWindowController } from "../window-manager/DefaultWindow";
import type { EditorSceneRunner } from "../Editor";
import { useShortPooling } from "../../hooks/useShortPooling";

export class SceneControlsController extends DefaultWindowController {
  public constructor(private sceneRunner: EditorSceneRunner) {
    super();
    this.title.setValue("Scene controls");
    this.widthHeight.setValue({ width: 300, height: 140 });
    this.renderBody.setValue(() => (
      <SceneControlsComponent sceneRunner={this.sceneRunner} />
    ));
  }
}

const SceneControlsComponent: React.FC<{
  sceneRunner: EditorSceneRunner;
}> = ({ sceneRunner }) => {
  const camera = sceneRunner.getCamera();

  const increaseZoom = (): void => {
    if (camera) {
      camera.zoom = camera.zoom + 0.2;
    }
  };

  const decreaseZoom = (): void => {
    if (camera) {
      camera.zoom = camera.zoom - 0.2;
    }
  };

  const resetZoom = (): void => {
    if (camera) {
      camera.zoom = 1;
    }
  };

  const play = (): void => {
    sceneRunner.unpause();
  };

  const pause = (): void => {
    sceneRunner.pause();
  };

  const reset = (): void => {
    sceneRunner.reset();
  };

  useShortPooling(1, 100, () => Math.random());

  return (
    <>
      <div className="p-2">Zoom: {sceneRunner.getCamera()?.zoom}</div>
      <br />
      <button
        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 p-3"
        onClick={increaseZoom}
      >
        +
      </button>
      <button
        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 p-3"
        onClick={decreaseZoom}
      >
        -
      </button>
      <button
        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 p-3"
        onClick={resetZoom}
      >
        reset
      </button>

      {sceneRunner.isPaused() ? (
        <button
          className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 p-3"
          onClick={play}
          style={{ width: 40 }}
        >
          {">"}
        </button>
      ) : (
        <button
          className="bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 p-3"
          onClick={pause}
          style={{ width: 40 }}
        >
          {"||"}
        </button>
      )}
      <button
        className="bg-blue-400 hover:bg-blue-500 active:bg-primary p-3"
        onClick={reset}
      >
        {"reset"}
      </button>
    </>
  );
};
