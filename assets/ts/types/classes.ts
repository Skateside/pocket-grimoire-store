import Observer from "../Observer";

export type ISliceReducer<
	TData = any,
	TPayload = TData,
    TEvents = Record<string, any>,
> = (
    state: TData,
    actions: {
        payload: TPayload,
        trigger: <K extends keyof TEvents>(
            eventName: K,
            detail: TEvents[K],
        ) => void,
    },
) => void;

export type ISliceSettings<
	TData = any,
    TReducers = Record<string, ISliceReducer<TData>>,
    TEvents = Record<string, any>,
> = {
    name: string,
	initialState: TData,
	reducers: {
		[K in keyof TReducers]: ISliceReducer<TData, TReducers[K], TEvents>;
	},
    save?: boolean | ((data: TData) => TData),
    load?: false | ((initialState: TData, data: TData) => void),
};

export type ISliceAction<
    TData = any,
    TPayload = TData,
> = (action: (payload: TPayload) => TData | null) => void;

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
}
