import type {
    AnyFunction,
    AnyObject,
} from "../../types/lib";
import type {
    IObserver,
} from "../../types/classes";

export type ISlice<
    TData = any,
    TModifiers extends AnyObject = {
        [K: string]: TData,
    },
    TAccessors extends Record<string, AnyFunction> = Record<string, AnyFunction>,
    TEvents extends AnyObject = AnyObject,
    THelpers extends Record<string, AnyFunction> = {},
> = {
    name: string,
    actions: ISliceActions<TModifiers>,
    references: ISliceReferences<TAccessors>,
    events: ISliceEvents<TData, TEvents>,
    helpers: ISliceHelpers<THelpers>,
    getData(): TData,
    save(): boolean,
    load(data?: TData): boolean,
    setObserver(observer: IObserver): void,
};

export type ISliceModifier<
    TData = any,
    TPayload = TData,
    TEvents = AnyObject,
> = (info: {
    payload: TPayload,
    state: TData,
    trigger: <K extends keyof TEvents>(
        eventName: K,
        detail: TEvents[K],
    ) => void
}) => void;

export type ISliceActions<TModifiers extends AnyObject> = {
    [K in keyof TModifiers]: (payload: TModifiers[K]) => void;
};

export type ISliceAccessor<
    TData = any,
    TAccessor extends AnyFunction = AnyFunction,
    TReferences = ISliceReferences,
    THelpers extends Record<string, AnyFunction> = {},
> = (
    (info: {
        state: TData,
        references: TReferences,
        helpers: THelpers,
    }, ...args: Parameters<TAccessor>) => ReturnType<TAccessor>
);

export type ISliceReferences<TAccessors extends Record<string, AnyFunction> = Record<string, AnyFunction>> = {
    [K in keyof TAccessors]: (...args: Parameters<TAccessors[K]>) => ReturnType<TAccessors[K]>
};

export type ISliceSettings<
    TData = any,
    TModifiers = Record<string, ISliceModifier<TData>>,
    TAccessors extends Record<string, AnyFunction> = Record<string, AnyFunction>,
    TEvents = AnyObject,
    THelpers extends Record<string, AnyFunction> = {},
> = {
    name: string,
    initialState: TData,
    modifiers: {
        [K in keyof TModifiers]: ISliceModifier<TData, TModifiers[K], TEvents>;
    },
    accessors?: {
        [K in keyof TAccessors]: ISliceAccessor<TData, TAccessors[K], Omit<ISliceReferences<TAccessors>, K>>;
    },
    helpers?: ISliceHelpers<THelpers>,
    save?: boolean | ((data: TData) => TData),
    load?: false | ((initialState: TData, data?: TData) => TData),
};

export type ISliceEvents<
    TData = any,
    TEventMap extends AnyObject = AnyObject,
> = Pick<IObserver<{ updateStore: TData, save: TData, load: TData } & TEventMap>, "on" | "off">;

export type ISliceHelper<TFunction extends AnyFunction = AnyFunction> = TFunction;

export type ISliceHelpers<THelpers extends Record<string, AnyFunction> = {}> = {
    [K in keyof THelpers]: ISliceHelper<THelpers[K]>;
};
