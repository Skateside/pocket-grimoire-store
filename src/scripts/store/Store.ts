import type {
    IObserver,
} from "../types/classes";
import type {
    ISlice,
} from "./types/slice";
import type {
    IStore,
    IStoreSettings,
} from "./types/store";
import type {
    IStorage,
} from "./types/storage";
import {
    UnrecognisedSliceError,
} from "../errors";

export default class Store implements IStore {

    protected slices: Record<string, ISlice>;
    protected storage: IStorage;
    public events: IObserver;

    constructor({ observer, storage }: IStoreSettings) {

        this.slices = Object.create(null);
        this.events = observer;
        this.storage = storage;

    }

    addSlice(slice: ISlice) {

        const { slices, events } = this;
        const { name } = slice;

        slices[name] = slice;
        slice.setObserver(events);

        const { on } = slice.events;

        on("save", (data) => {
            this.storage.set(name, data);
        });

        on("updateStore", () => {
            events.trigger("updateStore", this.getFullState());
        });

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
        return this.getSlice(name).getData();
    }

    getFullState() {

        return Object.fromEntries(
            Object.keys(this.slices).map((key) => [key, this.getState(key)])
        );

    }

    saveSlice(name: string) {
        this.getSlice(name).save();
    }

    loadSlice(name: string) {
        this.getSlice(name).load(this.storage.get(name));
    }

    save() {
        Object.keys(this.slices).forEach((name) => this.saveSlice(name));
    }

    load() {
        Object.keys(this.slices).forEach((name) => this.loadSlice(name));
    }

    run() {

        this.load();
        this.events.trigger("run", this.getFullState());

    }

}
