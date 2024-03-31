import { DefaultOnlineCanvasSceneRunner } from "./scene/DefaultOnlineCanvasSceneRunner";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const demoCanvasSceneRunner = new DefaultOnlineCanvasSceneRunner(
  "http://localhost:3000/",
  canvas,
);

demoCanvasSceneRunner.start();
