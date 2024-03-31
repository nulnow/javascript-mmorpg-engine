import {
  DefaultOfflineCanvasSceneRunner,
  defaultWindowSizeSubject,
} from "./DefaultOfflineCanvasSceneRunner";
import { ClientEntityManager } from "../ClientEntityManager";
import { SocketIoClientTransferImplementation } from "../transfer/transfer-implementations/socket-io-client-transfer-implementation";
import { DefaultEntityJsonSerializer } from "../../shared/serializer/entity/DefaultEntityJsonSerializer";
import { AssetManager } from "../../shared/asset-manager/AssetManager";

export class DefaultOnlineCanvasSceneRunner extends DefaultOfflineCanvasSceneRunner {
  public constructor(
    private url: string,
    sizeSubject = defaultWindowSizeSubject,
  ) {
    super(sizeSubject);
  }

  public setUp(): void {
    super.setUp();

    const entitySerializer = new DefaultEntityJsonSerializer(AssetManager);
    const clientTransfer = new SocketIoClientTransferImplementation(
      entitySerializer,
    );
    clientTransfer.setUpConnection(this.url);
    this.clientTransfer = clientTransfer;
    this.clientEntityManager = new ClientEntityManager(this.clientTransfer);
  }

  public start(): void {
    this.stopTickerFn = this.ticker.subscribe((dt) => {
      this.clientEntityManager.update(dt);
      this.renderer.render(this.scene);
    });
  }

  public stop(): void {
    this.stopTickerFn();
  }
}
