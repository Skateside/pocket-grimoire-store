import type {
    IObserverHandler,
    IObserverTrigger,
} from "./types/classes";

export default class Observer<
    TEventMap extends Record<string, any> = Record<string, any>,
> {

    private element: HTMLElement;
    private map = new WeakMap<IObserverHandler, EventListener>();

    constructor() {
        this.element = document.createElement("div");
    }

    convert<TDetailType = any>(handler: IObserverHandler<TDetailType>) {

        const converted = (
            (event: CustomEvent) => handler(event.detail, {
                cancel() {
                    event.preventDefault();
                },
                stop() {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                },
            })
        ) as EventListener;
        this.map.set(handler, converted);
        return converted;

    }

    unconvert(handler: IObserverHandler) {
        return (this.map.get(handler) || handler) as EventListener;
    }

    on<K extends keyof TEventMap>(
        eventName: K,
        handler: IObserverHandler<TEventMap[K]>,
    ) {

        this.element.addEventListener(
            eventName as string,
            this.convert(handler),
        );

    }

    off<K extends keyof TEventMap>(
        eventName: K,
        handler: IObserverHandler<TEventMap[K]>,
    ) {

        this.element.removeEventListener(
            eventName as string,
            this.unconvert(handler),
        );

    }

    trigger<K extends keyof TEventMap>(
        eventName: K,
        detail: TEventMap[K],
    ) {

        const event = new CustomEvent(eventName as string, {
            detail,
            cancelable: true,
        });
        this.element.dispatchEvent(event);

        return {
            get cancelled() {
                return event.defaultPrevented;
            },
        } as IObserverTrigger;

    }

}
