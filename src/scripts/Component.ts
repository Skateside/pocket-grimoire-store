import type {
    IComponent,
    IComponentData,
    IComponentRender,
    IComponentRenderInfo,
} from "./types/classes";
import type {
    AnyObject,
} from "./types/lib";

export default class Component<
    TData extends AnyObject = AnyObject
> implements IComponent<TData> {

    public readonly name: string;
    static data: IComponentData = Object.create(null);

    constructor(name: string, render: IComponentRender<TData>) {

        this.name = name;
        this.render = render;

        this.readyData();

    }

    render(_info: IComponentRenderInfo) {
        // This should get replaced in the constructor()
        return;
    }

    protected readyData() {

        const constructor = this.constructor as typeof Component;
        constructor.data[this.name] = Object.create(null);

    }

    set(key: string, value: any) {

        const constructor = this.constructor as typeof Component;
        constructor.data[this.name][key] = value;

    }

    get(key: string, defaultValue?: any) {

        const constructor = this.constructor as typeof Component;
        const data = constructor.data[this.name];

        if (Object.hasOwn(data, key)) {
            return data[key];
        }

        if (typeof defaultValue === "function") {
            defaultValue = defaultValue();
            this.set(key, defaultValue);
        }

        return defaultValue;

    }

}
