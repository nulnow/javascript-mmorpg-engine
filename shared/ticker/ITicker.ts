export type ITickerSubscriberFn = (
  timePassedFromPreviousTickMS: number,
) => void;
export type IUnsubscribeFromTickerFn = () => void;

export interface ITicker {
  subscribe(subscriber: ITickerSubscriberFn): IUnsubscribeFromTickerFn;
}
