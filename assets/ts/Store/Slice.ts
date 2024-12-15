import type {
    ISliceActions,
    ISliceEvents,
    ISliceSettings,
} from "../types/classes";
import Store from "./Store";

export default class Slice<
    TData = any,
    TModifiers extends Record<string, any> = {
        [K: string]: TData,
    },
    TAccessors extends Record<string, any> = Record<string, any>,
    TEvents extends Record<string, any> = Record<string, any>,
> {

    static defaultData: ISliceSettings = Object.freeze({
        name: "",
        initialState: {},
        modifiers: {},
        accessors: {},
        save: true,
        load(state, data) {
            Object.assign(state, data);
        },
    });

    public readonly name: string;
    public modifiers: TModifiers;
    public initialState: TData;
    public accessors: TAccessors;
    public actions: ISliceActions<TModifiers>;
    public events: ISliceEvents<TData, TEvents>;
    public save: ISliceSettings<TData>["save"];
    public load: ISliceSettings<TData>["load"];
    // protected store: Store;

    constructor(data: ISliceSettings<TData, TModifiers, TAccessors, TEvents>) {

        const constructor = this.constructor as typeof Slice;
        const config = Object.assign({}, constructor.defaultData, data);

        this.name = config.name;
        this.modifiers = config.modifiers as TModifiers;
        this.initialState = config.initialState;
        this.save = config.save;
        this.load = config.load;

    }

    register(store: Store) {

        const { name } = this;

        this.actions = store.makeActions(name, this.modifiers) as ISliceActions<TModifiers>;
        this.events = store.makeEvents(name) as ISliceEvents<TEvents>;

    }

}
