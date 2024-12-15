import Observer from "../Observer";

export type ISliceModifier<
	TData = any,
	TPayload = TData,
    TEvents = Record<string, any>,
> = (info: {
    payload: TPayload,
    state: TData,
    trigger: <K extends keyof TEvents>(
        eventName: K,
        detail: TEvents[K],
    ) => void
}) => void;

export type ISliceAccessor<
    TData = any,
    TResponse = any,
> = (info: {
    state: TData,
}) => TResponse;

export type ISliceSettings<
	TData = any,
    TModifiers = Record<string, ISliceModifier<TData>>,
    TAccessors = Record<string, ISliceAccessor<TData>>,
    TEvents = Record<string, any>,
> = {
    name: string,
	initialState: TData,
	modifiers: {
		[K in keyof TModifiers]: ISliceModifier<TData, TModifiers[K], TEvents>;
	},
    accessors?: {
        [K in keyof TAccessors]: ISliceAccessor<TData, TAccessors[K]>;
    },
    save?: boolean | ((data: TData) => TData),
    load?: false | ((initialState: TData, data: TData) => TData),
};

export type ISliceActions<TModifiers extends Record<string, any>> = {
    [K in keyof TModifiers]: (payload: TModifiers[K]) => void;
};

export type ISliceEvents<
    TData = any,
    TEventMap extends Record<string, any> = Record<string, any>,
> = Pick<Observer<{ updateStore: TData } & TEventMap>, "on" | "off">;


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
