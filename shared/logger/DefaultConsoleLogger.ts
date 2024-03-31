import { ILogger } from "./ILogger";

export class DefaultConsoleLogger implements ILogger {
  public warning(message: string): void {
    console.warn(
      `WARNING : ${JSON.stringify(new Date())} : ${DefaultConsoleLogger.name} : ${message}`,
    );
  }
}
