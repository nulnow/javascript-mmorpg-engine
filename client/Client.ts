import { ITicker } from "../shared/ticker/ITicker";

export class Client {
  private ticker: ITicker;

  public constructor(ticker: ITicker) {
    this.ticker = ticker;
  }
}
