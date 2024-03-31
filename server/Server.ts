/* eslint-disable @typescript-eslint/no-var-requires */
import { ITicker, IUnsubscribeFromTickerFn } from "../shared/ticker/ITicker";
import { IntervalTicker } from "../shared/ticker/IntervalTicker";
import { ServerEntityManager } from "./ServerEntityManager";
import { SocketIoServerTransferImplementation } from "./transfer/transfer-implementations/socket-io-server-transfer-implementation";
import { DefaultEntityJsonSerializer } from "../shared/serializer/entity/DefaultEntityJsonSerializer";
import { IMod } from "../shared/mod/IMod";
import { BehaviourSubject } from "../shared/behaviour-subject/BehaviourSubject";

const express = require("express");

const http = require("http");

const { Server } = require("socket.io");
const cors = require("cors");
const path = require("node:path");
const fsPromises = require("node:fs/promises");

const app = express();
app.use(cors("*"));
app.disable("x-powered-by");
app.set("etag", false);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const ASSETS_FOLDER_PATH = path.resolve(__dirname, "..", "assets");

const getSpritesByName = async (name: string): Promise<unknown> => {
  const result = {
    sprites: {},
    config: {},
  };

  const dirElements = await fsPromises.readdir(
    path.join(ASSETS_FOLDER_PATH, "sprites", name),
  );

  await Promise.all(
    dirElements.map(async (element) => {
      const elementPath = path.join(
        ASSETS_FOLDER_PATH,
        "sprites",
        name,
        element,
      );
      const stats = await fsPromises.lstat(elementPath);
      if (stats.isDirectory()) {
        const animations = await fsPromises.readdir(elementPath);

        result.sprites[element] = await Promise.all(
          animations.map(async (x) => ({
            name: x,
            url: path.join(ASSETS_FOLDER_PATH, "sprites", name, element, x),
            base64: Buffer.from(
              await fsPromises.readFile(
                path.join(ASSETS_FOLDER_PATH, "sprites", name, element, x),
              ),
            ).toString("base64"),
          })),
        );
      } else {
        if (element === "config.json") {
          result.config = JSON.parse(
            await fsPromises.readFile(
              path.join(ASSETS_FOLDER_PATH, "sprites", name, element),
              "utf8",
            ),
          );
        }
      }
    }),
  );

  return result;
};

const getAllSpritesNames = async () => {
  const result = [];

  const assetsSpritesDirectoryItems = await fsPromises.readdir(
    path.join(ASSETS_FOLDER_PATH, "sprites"),
  );

  await Promise.all(
    assetsSpritesDirectoryItems.map(async (assetsSpritesDirectoryItem) => {
      const stats = await fsPromises.lstat(
        path.resolve(ASSETS_FOLDER_PATH, "sprites", assetsSpritesDirectoryItem),
      );
      if (stats.isDirectory()) {
        result.push(assetsSpritesDirectoryItem);
      }
    }),
  );

  return result;
};

const getAllSprites = async () => {
  return await getAllSpritesNames()
    .then(async (names) => {
      const res = {};
      await Promise.all(
        names.map(async (name) => {
          res[name] = await getSpritesByName(name);
        }),
      );
      return res;
    })
    .then((result) => {
      // console.log(JSON.stringify(result, null, 4));
      return result;
    });
};

app.use(express.static(ASSETS_FOLDER_PATH));

const spritesPromise = getAllSprites();

app.get("/", (req, res) => {
  res.redirect("http://localhost:1234");
});

app.get("/sprites-config", async (req, res) => {
  const result = await spritesPromise;

  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(result, null, 4));
});

const ticker: ITicker = new IntervalTicker();

const entitySerializer = new DefaultEntityJsonSerializer(null);
const socketIoServerTransferImplementation =
  new SocketIoServerTransferImplementation(io, entitySerializer);
const serverEntityManager = new ServerEntityManager(
  socketIoServerTransferImplementation,
);

export const runServer = (mod: IMod, port = 3000): void => {
  mod.setEntityManager(serverEntityManager);
  mod.onInit();

  const sockets = new BehaviourSubject([]);

  let unsubscribeFromTicker: IUnsubscribeFromTickerFn;
  let subscribed = false;
  sockets.subscribe((sockets) => {
    if (sockets.length) {
      if (subscribed) {
        return;
      }

      unsubscribeFromTicker = ticker.subscribe((dt) => {
        serverEntityManager.update(dt);
      });

      subscribed = true;
    } else {
      subscribed = false;

      if (unsubscribeFromTicker) {
        unsubscribeFromTicker();
      }
    }
  });

  io.on("connect", (socket) => {
    sockets.setValue([...sockets.getValue(), socket]);
    console.log("a socket connected " + socket.id);
    mod.onUserConnected(socket);

    for (const entity of serverEntityManager.getEntities()) {
      socket.emit("entity_removed", entitySerializer.serialize(entity));
      socket.emit("entity_added", entitySerializer.serialize(entity));
    }

    socket.on("disconnect", () => {
      console.log("socket disconnected " + socket.id);
      mod.onUserDisconnected(socket);
      sockets.setValue(sockets.getValue().filter((s) => s !== socket));
      // serverEntityManager.removeEntity(playerEntity);
    });
  });

  server.listen(port, () => {
    console.log("listening on *:" + port);
  });
};
