import type {
    IAppGetSlice,
} from "./types/app";
import Store from "./store/Store";
import Slice from "./store/Slice";

export default class App {

    protected store: Store;
    protected components: ((getSlice: IAppGetSlice) => void)[];

    constructor({ store }: { store: Store }) {
        this.store = store;
        this.components = [];
    }

    addSlice(slice: Slice) {
        this.store.addSlice(slice);
        return this;
    }

    addComponent(component: (getSlice: IAppGetSlice) => void) {
        this.components.push(component);
        return this;
    }

    run() {

        const {
            components,
            store,
        } = this;

        store.run();

        const getSlice = ((name: string) => store.getSlice(name)) as IAppGetSlice;
        components.forEach((component) => component(getSlice));

    }

}
