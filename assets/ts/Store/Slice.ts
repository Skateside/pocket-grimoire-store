import type {
    ISliceAction,
    ISliceEvents,
    ISliceSettings,
} from "../types/classes";
import Store from "./Store";

export default class Slice<
    TData = any,
    TReducers extends Record<string, any> = {
        [K: string]: TData,
    },
    TEvents extends Record<string, any> = Record<string, any>,
    TActions extends Record<string, any> = {
        [K in keyof TEvents]: ISliceAction<TData, TEvents[K]>;
    },
> {

    static defaultData: ISliceSettings = Object.freeze({
        name: "",
        initialState: {},
        reducers: {},
        save: true,
        load(state, data) {
            Object.assign(state, data);
        },
    });

    public readonly name: string;
    public reducers: TReducers;
    public initialState: TData;
    public actions: TActions;
    public events: ISliceEvents<TData, TEvents>;
    public save: ISliceSettings<TData>["save"];
    public load: ISliceSettings<TData>["load"];
    // protected store: Store;

    constructor(data: ISliceSettings<TData, TReducers, TEvents>) {

        const constructor = this.constructor as typeof Slice;
        const config = Object.assign({}, constructor.defaultData, data);

        this.name = config.name;
        this.reducers = config.reducers as TReducers;
        this.initialState = config.initialState;
        this.save = config.save;
        this.load = config.load;

    }

    register(store: Store) {

        const { name } = this;

        this.actions = store.makeActions(name, this.reducers) as TActions;
        this.events = store.makeEvents(name) as ISliceEvents<TEvents>;

    }

}
