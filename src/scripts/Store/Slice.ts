import type {
    ISliceActions,
    ISliceEvents,
    ISliceReferences,
    ISliceSettings,
} from "../types/classes";
import type {
    AnyFunction,
} from "../types/lib";
import Store from "./Store";

export default class Slice<
    TData = any,
    TModifiers extends Record<string, any> = {
        [K: string]: TData,
    },
    TAccessors extends Record<string, AnyFunction> = Record<string, AnyFunction>,
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
    public initialState: TData;
    public modifiers: TModifiers;
    public accessors: TAccessors;
    public actions!: ISliceActions<TModifiers>;
    public references!: ISliceReferences<TAccessors>;
    public events!: ISliceEvents<TData, TEvents>;
    public save: ISliceSettings<TData>["save"];
    public load: ISliceSettings<TData>["load"];
    // protected store: Store;

    constructor(data: ISliceSettings<TData, TModifiers, TAccessors, TEvents>) {

        const constructor = this.constructor as typeof Slice;
        const config = Object.assign({}, constructor.defaultData, data);

        this.name = config.name;
        this.initialState = config.initialState;
        this.modifiers = config.modifiers as TModifiers;
        this.accessors = config.accessors as TAccessors;
        this.save = config.save;
        this.load = config.load;

    }

    register(store: Store) {

        const { name } = this;

        this.actions = store.makeActions(name, this.modifiers) as ISliceActions<TModifiers>;
        this.references = store.makeReferences(name, this.accessors) as ISliceReferences<TAccessors>;
        this.events = store.makeEvents(name) as ISliceEvents<TEvents>;

    }

}
