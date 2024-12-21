import type {
    IAppLookup,
} from "./types/app";
import Store from "./store/Store";
import Slice from "./store/Slice";

export default class App {

    protected store: Store;
    protected components: ((lookup: IAppLookup) => void)[];

    constructor({ store }: { store: Store }) {
        this.store = store;
        this.components = [];
    }

    addSlice(slice: Slice) {
        this.store.addSlice(slice);
        return this;
    }

    addComponent(component: (lookup: IAppLookup) => void) {
        this.components.push(component);
        return this;
    }

    run() {

        const {
            components,
            store,
        } = this;

        store.run();

        const lookup = ((name: string) => store.getSlice(name)) as IAppLookup;
        components.forEach((component) => component(lookup));

    }

}
