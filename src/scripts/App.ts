import type {
    IStore,
    IStoreSlices,
} from "./store/types/store";
import type {
    ISlice,
} from "./store/types/slice";
import type {
    IComponent,
    IComponents,
    IObserver,
    IObserverHandler,
} from "./types/classes";
import {
    SelfRenderingComponentError,
    UnrecognisedComponentError,
} from "./errors";
import Observer from "./Observer";

export default class App {

    protected store: IStore;
    protected components: Record<string, IComponent>;

    constructor({ store }: { store: IStore }) {

        this.store = store;
        this.components = Object.create(null);

    }

    addSlice(slice: ISlice) {
        this.store.addSlice(slice);
        return this;
    }

    registerComponent(component: IComponent) {
        this.components[component.name] = component;
    }

    render<K extends keyof IComponents>(
        id: K,
        data: IComponents[K],
        parent: {
            observer?: IObserver,
            ids?: string[],
        } = {},
    ): ReturnType<IComponent["render"]> {

        const {
            components,
            store,
            render,
        } = this;
        const component = components[id];

        if (!component) {
            throw new UnrecognisedComponentError(id);
        }

        const observer = new Observer();

        return component.render({
            data,
            getSlice<K extends keyof IStoreSlices>(name: K) {
                return store.getSlice(name) as IStoreSlices[K];
            },
            render<K extends keyof IComponents>(
                name: K,
                data: IComponents[K],
            ): ReturnType<IComponent["render"]> {

                const ids = [...(parent.ids || []), id];

                if (ids.includes(name)) {
                    throw new SelfRenderingComponentError(name);
                }

                return render(name, data, { observer, ids });

            },
            on(eventName: string, handler: IObserverHandler) {
                observer.on(eventName, handler);
            },
            off(eventName: string, handler: IObserverHandler) {
                observer.off(eventName, handler);
            },
            trigger(eventName: string, detail: any) {

                return parent.observer?.trigger(eventName, detail) ?? {
                    get cancelled() {
                        return false;
                    },
                };

            },
            set(key: string, value: any) {
                component.set(key, value);
            },
            get(key: string) {
                return component.get(key);
            },
        });

    }

    /**
     * @deprecated
     */
    run() {
        console.warn("we should stop calling App#run()");
    }

}
