import React, { memo, useEffect, useRef } from "react";
import { DefaultOfflineCanvasSceneRunner } from "../scene/DefaultOfflineCanvasSceneRunner";

interface ISceneRunnerProps {
  sceneRunner: DefaultOfflineCanvasSceneRunner & {
    setCanvas: (canvas: HTMLCanvasElement) => void;
  };
}

export const SceneRenderer: React.FC<ISceneRunnerProps> = memo(
  ({ sceneRunner }: ISceneRunnerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const effectCounter = useRef(0);

    useEffect(() => {
      effectCounter.current++;
      if (effectCounter.current !== 1) return;

      const canvas = canvasRef.current;
      sceneRunner.setCanvas(canvas);

      sceneRunner.start();
    }, []);

    return (
      <>
        <canvas style={{ background: "rgba(0,0,0,0.5)" }} ref={canvasRef} />
      </>
    );
  },
);
SceneRenderer.displayName = "SceneRenderer";
