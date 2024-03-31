import { Parcel, createWorkerFarm } from "@parcel/core";
import { MemoryFS } from "@parcel/fs";

const workerFarm = createWorkerFarm();
const outputFS = new MemoryFS(workerFarm);

const bundler = new Parcel({
  entries: "index.html",
  defaultConfig: "@parcel/config-default",
  additionalReporters: [
    {
      packageName: "@parcel/reporter-cli",
      resolveFrom: "./",
    },
  ],
  serveOptions: {
    port: 1234,
  },
  hmrOptions: {
    port: 1234,
  },
  workerFarm,
  outputFS,
});

(async () => {
  const subscription = await bundler.watch((err, event) => {
    if (err) {
      // fatal error
      throw err;
    }

    if (event.type === "buildSuccess") {
      const bundles = event.bundleGraph.getBundles();
      console.log(
        `✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`,
      );
    } else if (event.type === "buildFailure") {
      console.log(event.diagnostics);
    }
  });

  // some time later...
  //   await subscription.unsubscribe();
  // await bundler.watch();
})();
