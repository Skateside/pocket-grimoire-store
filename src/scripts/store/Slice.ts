import type {
    IObserver,
    IObserverHandler,
} from "../types/classes";
import type {
    ISlice,
    ISliceActions,
    ISliceEvents,
    ISliceHelpers,
    ISliceReferences,
    ISliceSettings,
    ISliceAccessor,
    ISliceModifier,
} from "./types/slice";
import type {
    AnyFunction,
    AnyObject,
    Tail,
} from "../types/lib";
import {
    SelfHelperError,
    SelfReferenceError,
} from "../errors";
import {
    difference,
    isEmptyObject,
    update,
} from "../utilities/objects";

export default class Slice<
    TData = any,
    TModifiers extends AnyObject = {
        [K: string]: TData,
    },
    TAccessors extends Record<string, AnyFunction> = Record<string, AnyFunction>,
    TEvents extends AnyObject = AnyObject,
    TMethods extends Record<string, AnyFunction> = {},
> implements ISlice<TData, TModifiers, TAccessors, TEvents, TMethods> {

    static defaultSettings: ISliceSettings = Object.freeze({
        name: "",
        initialState: {},
        modifiers: {},
        accessors: {},
        methods: {},
        save: true,
        load(state, data) {
            return Object.assign({}, state, data || {});
        },
    });

    public readonly name: string;
    protected initialState: TData;
    protected data: TData;
    protected observer?: IObserver;
    protected saveSetting: ISliceSettings<TData>["save"];
    protected loadSetting: ISliceSettings<TData>["load"];
    public actions: ISliceActions<TModifiers>;
    public references: ISliceReferences<TAccessors>;
    public events: ISliceEvents<TData, TEvents>;
    public helpers: ISliceHelpers<TMethods>;

    constructor(settings: ISliceSettings<TData, TModifiers, TAccessors, TEvents, TMethods>) {

        const constructor = this.constructor as typeof Slice;
        const config = Object.assign({}, constructor.defaultSettings, settings);

        this.name = config.name;
        this.initialState = config.initialState;
        this.saveSetting = config.save;
        this.loadSetting = config.load;
        this.data = structuredClone(config.initialState);
        this.actions = this.makeActions(config.modifiers as TModifiers);
        this.references = this.makeReferences(config.accessors as TAccessors);
        this.helpers = this.makeHelpers(config.methods as TMethods);
        this.events = this.makeEvents();

    }

    getData() {
        return structuredClone(this.data);
    }

    setObserver(observer: IObserver) {
        this.observer = observer;
    }

    protected makeActions(modifiers: TModifiers) {

        return Object.fromEntries(
            Object.entries(modifiers).map(([property, modifier]) => [
                property,
                this.makeAction(modifier),
            ])
        ) as unknown as ISliceActions<TModifiers>;

    }

    protected makeAction(modifier: ISliceModifier) {

        return <T = any>(payload: T) => {
            
            const {
                data,
                name,
                observer,
            } = this;
            const currentState = structuredClone(data);
            const givenState = structuredClone(data);
            const response = modifier({
                payload,
                state: givenState,
                helpers: { ...this.helpers },
                trigger(eventName: string, detail: any) {
                    observer?.trigger(`${name}/${eventName}`, detail);
                },
            });
            const responseState = (
                response === undefined
                ? givenState
                : response
            );
            const diff = difference(
                currentState as AnyObject,
                responseState as AnyObject,
            );

            if (isEmptyObject(diff)) {
                return;
            }

            this.data = update(currentState as AnyObject, diff) as TData;
console.log("calling save()");
            this.save();
            observer?.trigger(`${name}/updateStore`, this.data);

        };

    }

    protected makeReferences(accessors: Record<string, ISliceAccessor>) {

        return Object.fromEntries(
            Object.entries(accessors).map(([property, accessor]) => [
                property,
                this.makeReference(accessor, property),
            ])
        ) as ISliceReferences<TAccessors>;

    }
    
    protected makeReference(accessor: ISliceAccessor, property: string) {

        return (...args: Tail<Parameters<ISliceAccessor>>) => {

            const references = {
                ...this.references,
                [property]() {
                    throw new SelfReferenceError(property);
                },
            };

            return accessor({
                references,
                state: this.getData(),
                helpers: { ...this.helpers },
            }, ...args);

        };

    }

    protected makeEvents() {

        return {
            on: (eventName: string, handler: IObserverHandler) => {
                this.observer?.on(`${this.name}/${eventName}`, handler);
            },
            off: (eventName: string, handler: IObserverHandler) => {
                this.observer?.off(`${this.name}/${eventName}`, handler);
            },
        } as ISliceEvents<TEvents>;

    };

    protected makeHelpers(methods: TMethods) {

        return Object.fromEntries(
            Object.entries(methods).map(([name, method]) => [
                name,
                this.makeHelper(method, name),
            ])
        ) as unknown as ISliceHelpers<TMethods>;

    }

    protected makeHelper<TMethod extends AnyFunction>(
        method: TMethod,
        name: string,
    ) {

        return (...args: Tail<Parameters<TMethod>>) => {

            const helpers = {
                ...this.helpers,
                [name]() {
                    throw new SelfHelperError(name);
                },
            };

            return method({
                helpers,
            }, ...args);

        };

    }

    save() {

        const {
            data,
            name,
            observer,
            saveSetting,
        } = this;

        if (!saveSetting) {
            return false;
        }

        const state = (
            saveSetting === true
            ? this.data
            : saveSetting(data)
        );

        observer?.trigger(`${name}/save`, state);

        return true;

    }

    load(data?: TData) {

        const {
            name,
            observer,
            initialState,
            loadSetting,
        } = this;

        if (!loadSetting) {
            return false;
        }

        this.data = loadSetting(initialState, data);
        observer?.trigger(`${name}/load`, this.getData());

        return true;

    }

}
