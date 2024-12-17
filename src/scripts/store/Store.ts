import type {
    ISliceAccessor,
    ISliceModifier,
    IObserverHandler,
    IStoreSettings,
} from "../types/classes";
import type {
    Tail,
    AnyObject
} from "../types/lib";
import Slice from "./Slice";
import Storage from "./Storage";
import Observer from "../Observer";
import {
    UnrecognisedSliceError,
} from "../errors";
import {
    difference,
    isEmptyObject,
    update,
} from "../utilities/objects";

export default class Store {

    protected state: AnyObject;
    protected slices: Record<string, Slice>;
    protected storage: Storage;
    public events: Observer;

    constructor({ observer, storage }: IStoreSettings) {

        this.state = Object.create(null);
        this.slices = Object.create(null);
        this.events = observer;
        this.storage = storage;

    }

    addSlice(slice: Slice) {

        const { slices, state } = this;
        const { name, initialState } = slice;

        slices[name] = slice;
        state[name] = initialState;

        slice.register(this);

    }

    makeActions(
        name: string,
        modifiers: Record<string, ISliceModifier>,
    ) {

        return Object.fromEntries(
            Object.entries(modifiers).map(([property, modifier]) => [
                property,
                this.makeAction(name, modifier),
            ])
        );

    }

    protected makeAction(name: string, modifier: ISliceModifier) {

        const { events, state } = this;

        return <T = any>(payload: T) => {

            const currentState = this.getState(name);
            const givenState = structuredClone(currentState);
            const response = modifier({
                payload,
                state: givenState,
                trigger(eventName: string, detail: any) {
                    events.trigger(`${name}/${eventName}`, detail);
                },
            });
            const responseState = (
                response === undefined
                ? givenState
                : response
            );
            const diff = difference(currentState, responseState);
            
            if (isEmptyObject(diff)) {
                return;
            }

            state[name] = update(currentState, diff);
            events.trigger(`${name}/updateStore`, state[name]);
            events.trigger("updateStore", state);

        };

    }

    makeReferences(
        name: string,
        accessors: Record<string, ISliceAccessor>,
    ) {

        return Object.fromEntries(
            Object.entries(accessors).map(([property, accessor]) => [
                property,
                (...args: Tail<Parameters<ISliceAccessor>>) => (
                    accessor({ state: this.getState(name) }, ...args)
                ),
            ])
        );

    }

    makeEvents(name: string) {

        const { events } = this;

        return {
            on(eventName: string, handler: IObserverHandler) {
                events.on(`${name}/${eventName}`, handler);
            },
            off(eventName: string, handler: IObserverHandler) {
                events.off(`${name}/${eventName}`, handler);
            },
        };

    }

    getSlice(name: string) {

        const { slices } = this;

        if (!Object.hasOwn(slices, name)) {
            throw new UnrecognisedSliceError(name);
        }

        // TODO: Allow type-safe slices to be returned.
        return slices[name];

    }

    getState(name: string) {

        const { state } = this;

        if (!Object.hasOwn(state, name)) {
            throw new UnrecognisedSliceError(name);
        }

        // TODO: return a copy rather than a reference.
        return state[name];

    }

    saveSlice(name: string) {

        const slice = this.getSlice(name);

        if (!slice.save) {
            return false;
        }

        const state = this.getState(name);
        const data = (
            slice.save === true
            ? state
            : slice.save(state)
        );

        this.storage.set(name, data);

        return true;

    }

    loadSlice(name: string) {

        const slice = this.getSlice(name);

        const { initialState } = slice;

        this.state[name] = (
            slice.load
            ? slice.load(initialState, this.storage.get(name))
            : initialState
        );

    }

    save() {
        Object.keys(this.slices).forEach((name) => this.saveSlice(name));
    }

    load() {
        Object.keys(this.slices).forEach((name) => this.loadSlice(name));
    }

    run() {

        this.load();

        const { events } = this;

        Object.keys(this.slices).forEach((name) => {
            events.on(`${name}/updateStore`, () => this.saveSlice(name));
        });

        events.trigger("run", this.state);

    }

}
