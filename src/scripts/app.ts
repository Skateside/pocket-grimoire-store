import type {
    IAppLookup,
} from "./types/app";
import Store from "./store/Store";
import Slice from "./store/Slice";
import Observer from "./Observer";
import Storage from "./store/Storage";
import infoTokensSlice from "./store/slices/infotokens/slice";
import infoTokensComponent from "./components/infoTokens";

class App {

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

        // store.run();

    }

}

const application = new App({
    store: new Store({
        observer: new Observer(),
        storage: new Storage("pg"),
    }),
});

application
    .addSlice(infoTokensSlice)
    .addComponent(infoTokensComponent)
    .run();

console.log({ application });
