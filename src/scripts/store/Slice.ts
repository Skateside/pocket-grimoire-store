import type {
    ISliceActions,
    ISliceEvents,
    ISliceHelpers,
    ISliceReferences,
    ISliceSettings,
} from "./types/slice";
import type {
    AnyFunction,
    AnyObject,
} from "../types/lib";
import Store from "./Store";

export default class Slice<
    TData = any,
    TModifiers extends AnyObject = {
        [K: string]: TData,
    },
    TAccessors extends Record<string, AnyFunction> = Record<string, AnyFunction>,
    TEvents extends AnyObject = AnyObject,
    THelpers extends Record<string, AnyFunction> = {},
> {

    static defaultData: ISliceSettings = Object.freeze({
        name: "",
        initialState: {},
        modifiers: {},
        accessors: {},
        helpers: {},
        save: true,
        load(state, data) {
            return Object.assign({}, state, data || {});
        },
    });

    public readonly name: string;
    public initialState: TData;
    protected modifiers: TModifiers;
    protected accessors: TAccessors;
    public actions!: ISliceActions<TModifiers>;
    public references!: ISliceReferences<TAccessors>;
    public events!: ISliceEvents<TData, TEvents>;
    public helpers: ISliceHelpers<THelpers>;
    public save: ISliceSettings<TData>["save"];
    public load: ISliceSettings<TData>["load"];

    constructor(data: ISliceSettings<TData, TModifiers, TAccessors, TEvents, THelpers>) {

        const constructor = this.constructor as typeof Slice;
        const config = Object.assign({}, constructor.defaultData, data);

        this.name = config.name;
        this.initialState = config.initialState;
        this.modifiers = config.modifiers as TModifiers;
        this.accessors = config.accessors as TAccessors;
        this.helpers =  config.helpers as THelpers;
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
