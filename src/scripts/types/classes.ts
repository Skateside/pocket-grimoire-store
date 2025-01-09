import type { AnyObject } from "./lib"

// Observer

export type IObserver<TEventMap extends AnyObject = AnyObject> = {
    on<K extends keyof TEventMap>(
        eventName: K,
        handler: IObserverHandler<TEventMap[K]>,
    ): void,
    off<K extends keyof TEventMap>(
        eventName: K,
        handler: IObserverHandler<TEventMap[K]>,
    ): void,
    trigger<K extends keyof TEventMap>(
        eventName: K,
        detail: TEventMap[K],
    ): IObserverTrigger,
};

export type IObserverHandler<TDetailType = any> = (
    detail: TDetailType,
    actions: {
        cancel(): void,
        stop(): void,
    },
) => any;

export type IObserverTrigger = {
    cancelled: Readonly<boolean>,
};
