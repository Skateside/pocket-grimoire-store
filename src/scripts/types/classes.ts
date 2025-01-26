import type { IAppGetSlice } from "./app";
import type { AnyObject } from "./lib"

// Component

export type IComponent<TData extends AnyObject = AnyObject> = {
    name: string,
    render: IComponentRender<TData>,
    set(key: string, value: any): void,
    get(key: string, defaultValue?: any): any,
};

export type IComponentData = Record<string, AnyObject>;

export type IComponentRenderInfo<
    TData extends AnyObject = AnyObject,
> = {
    data: TData,
    getSlice: IAppGetSlice,
    render<K extends keyof IComponents>(name: K, data?: IComponents[K]): DocumentFragment | HTMLElement | void,
    on: IObserver["on"],
    off: IObserver["off"],
    trigger: IObserver["trigger"],
    set: IComponent["set"],
    get: IComponent["get"],
};

export type IComponentRender<TData extends AnyObject = AnyObject> = (
    info: IComponentRenderInfo<TData>,
) => DocumentFragment | HTMLElement | void;

export type IComponentGameData = {};
export type IComponentInfoTokenDialogData = {
    id: string,
};
export type IComponentInfoTokenFormData = {};
export type IComponentInfoTokenListData = {};
export type IComponentInfoTokenTriggerData = {
    id: string,
    text: string,
};
export type IComponentRoleTokenData = {
    id: string,
    imageIndex?: 0 | 1 | 2,
};

export type IComponents = {
    "game": IComponentGameData,
    "info-token-dialog": IComponentInfoTokenDialogData,
    "info-token-form": IComponentInfoTokenFormData,
    "info-token-list": IComponentInfoTokenListData,
    "info-token-trigger": IComponentInfoTokenTriggerData,
    "role-token": IComponentRoleTokenData,
};

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
