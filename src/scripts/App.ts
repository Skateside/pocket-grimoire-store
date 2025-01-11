import type {
    IAppGetSlice,
} from "./types/app";
import type {
    IStore,
} from "./store/types/store";
import type {
    ISlice,
} from "./store/types/slice";

export default class App {

    protected store: IStore;
    protected components: ((getSlice: IAppGetSlice) => void)[];

    constructor({ store }: { store: IStore }) {
        this.store = store;
        this.components = [];
    }

    addSlice(slice: ISlice) {
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
